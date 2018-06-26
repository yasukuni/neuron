import {Injectable} from '@angular/core'
import {RepoBrief, RepoDetail} from '../classes/repo'
import 'rxjs/add/operator/toPromise'
import {EntryBrief, EntryRecord} from '../classes/entry'
import {Storage} from '@ionic/storage'
import * as moment from 'moment'
import * as _ from 'lodash'
import {CONST} from '../app/const'
import {ApiService} from './api.service'
import {ImpulseRecord} from '../classes/impulse'


@Injectable()
export class WordService {
  wordsLearning: ImpulseRecord[] = null
  wordsReviewing: ImpulseRecord[]

  constructor(
    private apiSvc: ApiService,
    private storage: Storage,
  ) {}


  initialize(): void {
    this.storage.get('wordsLearning')
      .then(data => this.wordsLearning = data)
    this.storage.get('wordsReviewing')
      .then(data => {
        this.wordsReviewing = data
        // this.freshWaits()
      })
  }

  saveWaitsFreshTime(): void {
    this.storage.set('wordWaitsFreshTime', moment().valueOf())
  }

  todayLearnedCount():Promise<number>{
    return this.apiSvc.get('/study/learn/today-count/')
  }

  async generateLearnList(repo:RepoBrief, amount:number):Promise<void>{
    const entryRecords:EntryRecord[] = await this.apiSvc.get('/study/learn/generate-list/', {
      'repoId': repo.id,
      'amount': amount
    })
    let count = 0
    for(let entryRecord of entryRecords){
      const word = new ImpulseRecord(entryRecord)
      word.wait = count
      this.wordsLearning.push(word)
    }
  }

  generateWordsReviewing(): void {
    this.wordsReviewing = []
    let i = 0
    for (let word in this.wordRecords) {
      let record = this.wordRecords[word]
      if (record.wait == 0) {
        let count
        switch (record.proficiency) {
          case 0:
            count = 1
            break
          case 1:
            count = 1
            break
          case 2:
            count = 2
            break
          case 3:
            count = 2
            break
          case 4:
            count = 2
            break
          case 5:
            count = 3
            break
          case 6:
            count = 3
            break
          case 7:
            count = 3
            break
          case 8:
            count = 3
            break
          default:
            count = 0
        }
        this.wordsReviewing.push({
          word: word,
          count: count,
          wait: i,
          dirty: 0,
        })
        i++
      }
    }
    this.saveWordsImpulsing('review');//this will override yesterday's entryRecord, if yesterday the user didn't finish reviewing
  }

  // generateWait(wordRecord: EntryRecord): void {
  //   let wait: number
  //   switch (wordRecord.proficiency) {
  //     case 0:
  //       wait = 1
  //       break
  //     case 1:
  //       wait = 2
  //       break
  //     case 2:
  //       wait = 3
  //       break
  //     case 3:
  //       wait = 7
  //       break
  //     case 4:
  //       wait = 15
  //       break
  //     case 5:
  //       wait = 30
  //       break
  //     case 6:
  //       wait = 60
  //       break
  //     case 7:
  //       wait = 120
  //       break
  //     case 8:
  //       wait = -1
  //       break
  //     default:
  //       wait = 1
  //   }
  //   wordRecord.wait = wait
  // }


  saveWordsImpulsing(type: string): void {
    if (type == 'learn') {
      this.storage.set('wordsLearning', this.wordsLearning)
    } else if (type == 'review') {
      this.storage.set('wordsReviewing', this.wordsReviewing)
    }
  }

  //we only need to remove wordsLearning cause user may generate more than one learning list but only one reviewing list in one day
  removeWordsLearning(): void {
    this.wordsLearning = null
    this.storage.remove('wordsLearning')
  }

  // freshImpulseData():void{
  //     this.storage.get('impulseData').then(data=>{
  //         this.impulseData=data
  //         console.log(data)
  //     })
  // }
  // saveImpulseData(impulseData):void{
  //     this.impulseData=impulseData
  //     this.storage.set('impulseData',impulseData)
  // }
  // removeImpulseData():void{
  //     this.impulseData=null
  //     this.storage.remove('impulseData')
  // }


  getEntry(word: string): Promise<EntryBrief> {
    return this.apiSvc.get(CONST.apiUrl + `/entry/${word}/`)
  }

  // addRecord(entry: EntryBrief, mark: string): void {
  //   //TODO
  //   let wordRecord
  //   if (mark == 'know') {
  //     wordRecord = new EntryRecord(6)
  //   } else if (mark == 'vague') {
  //     wordRecord = new EntryRecord(3)
  //   } else if (mark == 'forget') {
  //     wordRecord = new EntryRecord(0)
  //   } else if (mark == 'master') {
  //     wordRecord = new EntryRecord(8)
  //   }
  //   this.generateWait(wordRecord)
  //   this.wordRecords[word] = wordRecord
  //   this.saveWordRecords()
  //   //generate history
  //   let today = moment().format('YYYY-M-D')
  //   if (this.history[today] == null) {
  //     this.history[today] = {
  //       learn: 0,
  //       review: 0,
  //     }
  //   }
  //   this.history[today].learn++
  //   this.saveHistory()
  // }

  // moltRecord(entry: EntryBrief, mark: string): void {
  //   //TODO
  //   let wordRecord = this.wordRecords[word]
  //   if (mark == 'know') {
  //     wordRecord.proficiency++
  //   } else if (mark == 'vague') {
  //     if (wordRecord.proficiency > 0) wordRecord.proficiency--
  //   } else if (mark == 'forget') {
  //     if (wordRecord.proficiency > 2) {
  //       wordRecord.proficiency -= 2
  //     } else {
  //       wordRecord.proficiency = 0
  //     }
  //   } else if (mark == 'master') {
  //     wordRecord.proficiency = 8
  //   }
  //   this.generateWait(wordRecord)
  //   this.saveWordRecords()
  //   //generate history
  //   let today = moment().format('YYYY-M-D')
  //   if (this.history[today] == null) {
  //     this.history[today] = {
  //       learn: 0,
  //       review: 0,
  //     }
  //   }
  //   this.history[today].review++
  //   this.saveHistory()
  // }

  // deleteRecord(word: string): void {
  //   delete this.wordRecords[word]
  //   this.saveWordRecords()
  // }

}
