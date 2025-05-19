import ky, { KyResponse } from 'ky';

import { Injectable } from '@nestjs/common';
import { RequestPayloadOptions } from '../__defs__';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  apiResponse: T;
}

@Injectable()
export class HttpService {
  private readonly client: typeof ky;

  constructor() {
    this.client = ky.create({});
  }

  public async get<T = unknown>(
    getRequestPayloadOptions: RequestPayloadOptions,
  ): Promise<ApiResponse<T>> {
    const { endpointUrl, headerOptions } = getRequestPayloadOptions;
    const response: KyResponse = await this.client.get(
      endpointUrl,
      headerOptions,
    );
    const apiResponse = await response.json<T>();

    return { statusCode: response.status, apiResponse };
  }

  public async post<T = unknown>(
    postRequestPayloadOptions: RequestPayloadOptions,
  ): Promise<ApiResponse<T>> {
    const { endpointUrl, dataPayload, headerOptions } =
      postRequestPayloadOptions;
    const response: KyResponse = await this.client.post(endpointUrl, {
      json: dataPayload,
      ...headerOptions,
    });
    const apiResponse = await response.json<T>();

    return { statusCode: response.status, apiResponse };
  }

  public async put<T = unknown>(
    putRequestPayloadOptions: RequestPayloadOptions,
  ): Promise<ApiResponse<T>> {
    const { endpointUrl, dataPayload, headerOptions } =
      putRequestPayloadOptions;
    const response: KyResponse = await this.client.put(endpointUrl, {
      json: dataPayload,
      ...headerOptions,
    });
    const apiResponse = await response.json<T>();

    return { statusCode: response.status, apiResponse };
  }

  public async patch<T = unknown>(
    patchRequestPayloadOptions: RequestPayloadOptions,
  ): Promise<ApiResponse<T>> {
    const { endpointUrl, dataPayload, headerOptions } =
      patchRequestPayloadOptions;

    const response: KyResponse = await this.client.patch(endpointUrl, {
      json: dataPayload,
      ...headerOptions,
    });
    const apiResponse = await response.json<T>();

    return { statusCode: response.status, apiResponse };
  }
}
