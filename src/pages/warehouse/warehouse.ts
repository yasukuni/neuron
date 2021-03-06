import {Component} from '@angular/core'

import {NavController, AlertController} from 'ionic-angular'
import {StudyService} from '../../services/study.service'
import {EntryRecord} from '../../classes/entry'

@Component({
  selector: 'page-warehouse',
  templateUrl: 'warehouse.html',
})
export class WarehousePage {
  records: EntryRecord[] = []

  constructor(
    public navCtrl: NavController,
    private wordService: StudyService,
    private alertCtrl: AlertController,
  ) {}

  ionViewDidEnter(): void {
    for (let word in this.wordService.wordRecords) {
      let record = this.wordService.wordRecords[word]
      record.word = word
      this.records.push(record)
    }
  }

  deleteRecord(word: string, i: number): void {
    let alert = this.alertCtrl.create({
      title: '提醒',
      subTitle: '确定要把这个单词从已学单词中删除吗？',
      buttons: [
        {
          text: '取消',
        },
        {
          text: '确定',
          handler: data => {
            this.records.splice(i, 1)
            this.wordService.deleteRecord(word)
          },
        },
      ],
    })
    alert.present()
  }


}
