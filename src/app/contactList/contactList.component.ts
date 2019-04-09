import { Component, OnInit } from "@angular/core"
// import { Http } from '@angular/http'

import { ContactService } from '../shared/contact.service'

@Component({
    selector: "contactList",
    templateUrl: "app/contactList/contactList.component.html",
    styleUrls: ["app/contactList/contactList.component.css"]
})

export class ListComponent implements OnInit{

    contacts = {}

    constructor(
        private _contactService: ContactService
      ) {}

   

    ngOnInit() {
        // this.getContacts()
    }

    // getContacts() {
    //     this._contactService.getContactDatas().subscribe(data =>{
    //         this.contacts = data
    //     })
    // }
}