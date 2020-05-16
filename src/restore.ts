import * as core from '@actions/core'
import * as path from 'path'
import * as utils from './utils'
import AWS from 'aws-sdk'
import {CacheResult, CacheInfo} from './contracts'
import {Inputs, Outputs, State, CacheFileName} from './constants'
import {exec} from '@actions/exec'
import {writeFileSync, unlinkSync} from 'graceful-fs'

async function run(): Promise<void> {
  try {
    const bucket = core.getInput(Inputs.Bucket, {required: true})
    const key = path.join(
      core.getInput(Inputs.Key, {required: true}),
      CacheFileName
    )
    core.debug(`Key: ${key}`)

    const cacheInfo: CacheInfo = {
      Bucket: bucket,
      Key: key
    }

    const s3 = new AWS.S3()
    const param: AWS.S3.Types.GetObjectRequest = {...cacheInfo}

    try {
      const res = await s3.getObject(param).promise()
      core.info('Cache found')

      const archivePath = path.join(
        await utils.createTempDirectory(),
        CacheFileName
      )
      writeFileSync(archivePath, res.Body)

      try {
        await exec(`tar -zxf ${archivePath}`)
      } catch (error) {
        throw new Error(`Tar failed: ${error?.message}`)
      } finally {
        unlinkSync(archivePath)
      }
      core.info('Cache restored')
      core.setOutput(Outputs.CacheHit, true.toString())

      const state: CacheResult = {
        CacheInfo: cacheInfo,
        CacheHit: true
      }
      core.saveState(State.CacheResult, JSON.stringify(state))
    } catch (error) {
      core.info(`Cache not found`)
      core.debug(error.message)
      core.setOutput(Outputs.CacheHit, false.toString())

      const state: CacheResult = {
        CacheInfo: cacheInfo,
        CacheHit: false
      }
      core.saveState(State.CacheResult, JSON.stringify(state))
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

export default run
