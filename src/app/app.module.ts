import { NgModule } from "@angular/core"

import { BrowserModule } from "@angular/platform-browser"
import { RouterModule } from '@angular/router'

import { routerConfig } from './route.config'


import { AppComponent } from "./app.component"
import { HeaderComponent } from './header/header.component'
import { FooterComponent } from './footer/footer.component'
import { ListComponent } from './contactList/contactList.component'

@NgModule ({
    declarations: [AppComponent, HeaderComponent, FooterComponent, ListComponent],
    imports: [BrowserModule, RouterModule.forRoot(routerConfig)],
    bootstrap: [AppComponent]
})


export class AppModule {

}