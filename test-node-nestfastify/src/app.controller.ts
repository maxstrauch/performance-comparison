import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/json-generate')
  getJWT(): string {
    return this.appService.getJWT();
  }

  @Get("/index.html")
  getIndexHtml(): string {
      return '<html><head><title></title></head><body><h1>It works!</h1></body></html>';
  }

  @Get("/file_read_rfc2616.txt")
  getStaticFile(
    @Res() res: Response,
  ): void {
    fs.readFile(
        path.join(__dirname, '../html/rfc2616.txt'), 
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
    @Res() res: Response,
  ): void {
    fs.readFile(
        path.join(__dirname, '../html/rfc7523.txt'), 
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
