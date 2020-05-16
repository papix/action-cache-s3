export interface CacheInfo {
  Bucket: string
  Key: string
}

export interface CacheResult {
  CacheInfo: CacheInfo
  CacheHit: boolean
}
