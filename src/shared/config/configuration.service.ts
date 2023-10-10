import { ConfigService } from "@nestjs/config";

import config, { type configObjKeys, type configObjType } from "./config";

export class CustomConfigService extends ConfigService {
  public get<T extends configObjKeys>(key: T): configObjType[T] {
    const value = config()[key];
    if (value !== undefined) {
      return value;
    }
    const val = super.get(key);
    return val;
  }
}
