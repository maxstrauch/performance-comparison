import {Controller, Get, Response as Res, Req, Next} from "@tsed/common";
import * as fs from 'fs';
import * as path from 'path';
import { Response, Request, NextFunction } from 'express';

@Controller("")
export class FileCtrl {

  constructor() { }

  @Get("/index.html")
  getIndexHtml(): string {
      return '<html><head><title></title></head><body><h1>It works!</h1></body></html>';
  }

  @Get("/file_read_rfc2616.txt")
  getStaticFile(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ): void {
    fs.readFile(
        path.join(__dirname, '../../../html/rfc2616.txt'), 
        (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                res.status(500).send('');
            } else {
                res.status(200).type('text/plain').send(data);
            }
        }
    );
  }

  @Get("/file_read_rfc7523.txt")
  getStaticFile2(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ): void {
    fs.readFile(
        path.join(__dirname, '../../../html/rfc7523.txt'), 
        (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                res.status(500).send('');
            } else {
                res.status(200).type('text/plain').send(data);
            }
        }
    );
  }

}
