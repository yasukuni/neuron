import { Injectable } from '@angular/core';
import {RepoBrief, RepoDetail} from "../classes/repo";
import {Http} from "@angular/http";
import 'rxjs/add/operator/toPromise'
import {WordEntry, WordRecord} from "../classes/word";
import { Storage } from '@ionic/storage';


@Injectable()
export class WordService {
    constructor(private http:Http, private storage:Storage){
        this.storage.get('wordRecords').then((wordRecords:WordRecord[])=>{
            if (wordRecords) {
                this.wordRecords=wordRecords;
                // this.wordRecordsSubject.next(this.wordRecords);
                // console.log(this.wordRecordsSubject);
                console.log(this.wordRecords);
            }
        });
    }

    wordRecords:WordRecord[]=[];
    // wordRecordsSubject=new Subject<WordRecord[]>();
    // wordRecords$=this.wordRecordsSubject.asObservable();

    isStudied(word:string):boolean{
        for (let i = 0; i < this.wordRecords.length; i++) {
            if (this.wordRecords[i].word == word) {
                return true;
            }
        }
        return false;
    }

    generateWait(wordRecord:WordRecord):void{
        wordRecord.wait=Math.pow(2,wordRecord.proficiency);
    }

    // impulseData:any=null;
    wordsLearning:any[]=null;
    saveWordsLearning():void{
        this.storage.set('wordsLearning',this.wordsLearning);
    }
    freshWordsLearning():void{
        this.storage.get('wordsLearning')
            .then(data=>this.wordsLearning=data);
    }
    removeWordsLearning():void{
        this.wordsLearning=null;
        this.storage.remove('wordsLearning');
    }
    // freshImpulseData():void{
    //     this.storage.get('impulseData').then(data=>{
    //         this.impulseData=data;
    //         console.log(data);
    //     });
    // }
    // saveImpulseData(impulseData):void{
    //     this.impulseData=impulseData;
    //     this.storage.set('impulseData',impulseData);
    // }
    // removeImpulseData():void{
    //     this.impulseData=null;
    //     this.storage.remove('impulseData');
    // }


    getEntry(word:string):Promise<WordEntry>{
        return this.http.get(`/api/entry/${word}/`)
            .toPromise()
            .then(response=>response.json() as WordEntry);
    }

    addRecord(word:string,mark:string):void{
        let wordRecord;
        if (mark == 'know') {
            wordRecord=new WordRecord(word,6);
        }else if (mark == 'vague') {
            wordRecord=new WordRecord(word,3);
        }else if (mark == 'forget') {
            wordRecord=new WordRecord(word,0);
        }else if (mark == 'master') {
            wordRecord=new WordRecord(word,8);
        }
        this.generateWait(wordRecord);
        this.wordRecords.push(wordRecord);
        // this.wordRecordsSubject.next(this.wordRecords);
        this.storage.set('wordRecords',this.wordRecords);
        console.log(this.wordRecords);
    }

    getRepos():Promise<RepoBrief[]> {
        return this.http.get('/api/repo/list/')
            .toPromise()
            .then(response=>response.json() as RepoBrief[]);
    }
    getRepo(id:number,needHash:boolean):Promise<RepoDetail> {
        return this.http.get(`/api/repo/${id}/`)
            .toPromise()
            .then(response=>new RepoDetail(response.json(),needHash) as RepoDetail);
    }
}
