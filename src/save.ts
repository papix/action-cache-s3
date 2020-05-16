import * as core from '@actions/core'
import * as path from 'path'
import * as utils from './utils'
import AWS from 'aws-sdk'
import {CacheResult} from './contracts'
import {Inputs, State, CacheFileName} from './constants'
import {exec} from '@actions/exec'
import {readFileSync} from 'graceful-fs'

async function run(): Promise<void> {
  try {
    const stateData = core.getState(State.CacheResult)
    core.debug(`State: ${stateData}`)

    const cacheResult = JSON.parse(stateData) as CacheResult

    if (cacheResult.CacheHit) {
      core.info('Cache hit occurred, not saving cache.')
      return
    }

    const archiveFolder = await utils.createTempDirectory()
    const archivePath = path.join(archiveFolder, CacheFileName)
    core.debug(`Archive Path: ${archivePath}`)

    const cachePath = core.getInput(Inputs.Path, {required: true})

    try {
      await exec(`tar -zcf ${archivePath} ${cachePath}`)
    } catch (error) {
      throw new Error(`Tar failed: ${error?.message}`)
    }

    const s3 = new AWS.S3()
    const param: AWS.S3.Types.PutObjectRequest = {
      Bucket: cacheResult.CacheInfo.Bucket,
      Key: cacheResult.CacheInfo.Key,
      Body: readFileSync(archivePath)
    }
    try {
      await s3.putObject(param).promise()
      core.info('Cache saved successfully')
    } catch (error) {
      utils.logWarnings(`Failed upload to S3: ${error.message}`)
    }
  } catch (error) {
    utils.logWarnings(error.message)
  }
}

run()

export default run
