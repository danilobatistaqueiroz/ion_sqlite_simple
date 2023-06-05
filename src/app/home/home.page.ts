import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Product } from '../models/product';

import { CapacitorSQLite, CapacitorSQLitePlugin, JsonSQLite, SQLiteConnection, SQLiteDBConnection, capSQLiteResult, capSQLiteUpgradeOptions } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  isAndroid: boolean = false;

  products?: Product[];

  dbName:string='products';
  dbVersion:number=1;

  sqliteConnection!: SQLiteConnection;
  sqlitePlugin!: CapacitorSQLitePlugin;

  dbConnection!: SQLiteDBConnection;

  constructor(private platform:Platform) {}

  async ngOnInit() {
    if (this.platform.is('android')) {
      this.isAndroid = true;
    }
    await this.initializeSqlite();
    await this.openConnection(this.dbName,false,"no-encryption",this.dbVersion,false);
    await this.insertProduct();
  }

  async initializeSqlite() {
    console.log('initializeSqlite');
    await this.initializePlugin().then(async (ret) => {
      try {
        if(Capacitor.getPlatform()==="web") {
          await this.initWebStore();
        }
        await this.initializeStructureDB();
      } catch (error) {
        console.error(error)
      }
    });
  }

  async initializeStructureDB(){
    console.log('initializeStructureDB');
    let commands = [
      `CREATE TABLE product (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        name varchar NOT NULL,
        description varchar NOT NULL,
        price bigint,
        photo blob,
        CONSTRAINT "product_name_constraintUQ" UNIQUE ("name")
      );`,
      `CREATE INDEX product_index_name ON product (name);`,
    ]
    let options = { database: this.dbName, upgrade: [{toVersion: this.dbVersion, statements: commands}]};
    await this.sqlitePlugin.addUpgradeStatement(options);
  }

  async initWebStore(): Promise<void> {
    try {
      console.log('initWebStore');
      await this.sqliteConnection.initWebStore();
    } catch(err: any) {
      console.error(err);
      return Promise.reject(`initWebStore: ${err}`);
    }
  }

  async initializePlugin(): Promise<boolean> {
    this.sqlitePlugin = CapacitorSQLite;
    this.sqliteConnection = new SQLiteConnection(this.sqlitePlugin);
    return true;
  }

  async getAllProducts(): Promise<Product[]> {
    this.products = (await this.dbConnection.query("select * from product")).values as Product[];
    return this.products;
  }

  async openConnection(dbName:string, encrypted: boolean, mode: string, version: number, readonly: boolean) {
    console.log('openConnection');
    let db: SQLiteDBConnection;
    const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    let isConn = (await this.sqliteConnection.isConnection(dbName, readonly)).result;
    if(retCC && isConn) {
      db = await this.sqliteConnection.retrieveConnection(dbName, readonly);
    } else {
      db = await this.sqliteConnection.createConnection(dbName, encrypted, mode, version, readonly);
    }
    await db.open();
    console.log(db);
    this.dbConnection = db;
  }

  exitApp() {
    App.exitApp();
  }

  openSqlite(){

  }

  async insertProduct(name:string='iPhone7',description:string='novo iphone',price:number=1000){
    console.log('insertProduct',name,description,price);
    let result:Product[] = (await this.dbConnection.query("select * from product where name=?",[name])).values as Product[];
    if(result.length==0) {
      await this.dbConnection.run("insert into product (name,description,price,photo) values (?,?,?,?);",[name,description,price,null],false);
      if(Capacitor.getPlatform()==="web") {
        await this.sqliteConnection.saveToStore(this.dbName);
      }
    }
  }

}
