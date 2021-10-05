import { expect, describe, test, jest, beforeEach } from "@jest/globals";
import fs from 'fs'
import { resolve } from 'path';
import { pipeline } from 'stream/promises';
import { logger } from "../../src/logger.js";
import Routes from '../../src/routes.js';
import UploadHandler from "../../src/uploadHandler.js";
import TestUtil from "../_util/testUtil.js";

describe('#UploadHandler test suit', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {}
  };

  beforeEach(() => {
    jest.spyOn(logger, 'info')
        .mockImplementation();
  });

  describe('#registerEvents', () => {
    test('should call onFile and onFinish functions on Busboy instance', () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '01'
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        'content-type': 'multipart/form-data; boundary='
      };

      const onFinish  = jest.fn();
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

      const fileStream = TestUtil.generateReadableStream(['chunk', 'of', 'data']);
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt');

      busboyInstance.listeners('finish')[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    });
  });

  describe('#onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunk = ['hey', 'dude'];
      const downloadsFolder = '/tmp';
      const handler = new UploadHandler({
        io: ioObj,
        socketId: '01',
        downloadsFolder
      });

      const onData = jest.fn();

      jest.spyOn(fs, fs.createWriteStream.name)
          .mockImplementation(() => TestUtil.generateWritableStream(onData));

      const onTransform = jest.fn();
      jest.spyOn(handler, handler.handleFileBytes.name)
          .mockImplementation(() => TestUtil.generateTransformStream(onTransform));

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadableStream(chunk),
        filename: 'mockFile.mov'
      }

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunk.join());
      expect(onTransform.mock.calls.join()).toEqual(chunk.join());

      const expectFilename = resolve(handler.downloadsFolder, params.filename);
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectFilename);
    });
  });

  describe('#handlerFileBytes', () => {
    test('should call emit function and it is a transform stream', async () => {
      const handler = new UploadHandler({
        io: ioObj,
        socketId: '01'
      });
      
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);
      jest.spyOn(handler, handler.canExecute.name)
          .mockReturnValue(true);

      

      const messages = ['hello'];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      await pipeline(
        source,
        handler.handleFileBytes('filename.txt'),
        target
      )

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

      expect(onWrite).toBeCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });
  });
});