
import * as express from 'express';

declare function postNormalize(): express.RequestHandler;

declare namespace postNormalize { }

export = postNormalize;
