import { expect, describe, test, jest } from "@jest/globals";
import fs from 'fs';
import FileHelper from "../../src/fileHelper.js";
import Routes from "../../src/routes.js";

describe('src :: fileHelper', () => {
  describe('#getFilesStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 2053,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 5767832,
        size: 4055780,
        blocks: 7928,
        atimeMs: 1631386617745.034,
        mtimeMs: 1626393666486.605,
        ctimeMs: 1631386448496.8975,
        birthtimeMs: 1631386448412.8994,
        atime: '2021-09-11T18:56:57.745Z',
        mtime: '2021-07-16T00:01:06.487Z',
        ctime: '2021-09-11T18:54:08.497Z',
        birthtime: '2021-09-11T18:54:08.413Z'
      }

      const mockUser = 'andreisantos';
      process.env.USER = mockUser;
      const filename = 'file.png';
      jest.spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename]);
      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock);

      const result = await FileHelper.getFilesStatus('/tmp');

      const expectResult = [
        {          
          size: '4.06 MB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename
        }
      ];
      
      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);
      expect(result).toMatchObject(expectResult);
    });
  });
});