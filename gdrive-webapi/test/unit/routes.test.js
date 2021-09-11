import { expect, describe, test, jest } from "@jest/globals";
import Routes from "../../src/routes.js";

describe('src :: routes', () => {
  const defaultParams = {
    request: {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      method: '',
      body: {}
    },
    response : {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    },
    values: () => Object.values(defaultParams)
  }

  describe('#setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes();
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {}
      }
      
      routes.setSocketInstance(ioObj);
      expect(routes.io).toStrictEqual(ioObj)
    });
  });
  
  describe('#handler', () => {
    

    test('given an inexistent route it choose #defaultRoute', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent';
      await routes.handler(...params.values());
      expect(params.response.end).toHaveBeenCalledWith('hello world');
    });

    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent';
      await routes.handler(...params.values());
      expect(params.response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });

    test('given method #options it should choose options route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams
      }

      params.request.method = 'OPTIONS';
      await routes.handler(...params.values());
      expect(params.response.writeHead).toHaveBeenCalledWith(204);
      expect(params.response.end).toHaveBeenCalledWith();
    });

    test('given method #post it should choose post route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams
      }

      params.request.method = 'POST';
      jest.spyOn(routes, routes.post.name).mockResolvedValue()
      await routes.handler(...params.values());
      expect(routes.post).toHaveBeenCalled();
    });
    test('given method #get it should choose get route', async () => {
      const routes = new Routes();
      const params = {
        ...defaultParams
      }

      params.request.method = 'GET';
      jest.spyOn(routes, routes.get.name).mockResolvedValue()
      await routes.handler(...params.values());
      expect(routes.get).toHaveBeenCalled();
    });
  });

  describe('#get', () => {
    test('given method GET it should list all files downloads', async () => {
      const routes = new Routes();

      const params = {
        ...defaultParams
      }

      const filesStatusesMock = [
        {          
          size: '4.06 MB',
          lastModified: '2021-09-11T18:54:08.413Z',
          owner: 'andreisantos',
          file: 'files.png'
        }
      ];
      
      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock);
      
      params.request.method = 'GET';
      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(filesStatusesMock));
    });
  });
})