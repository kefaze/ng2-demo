import { Routes } from '@angular/router'

import { ListComponent } from './contactList/contactList.component'

export const routerConfig: Routes = [
    {
        path: '',
        redirectTo: "list",
        pathMatch: 'full'
    },
    {
        path: 'list',
        component: ListComponent
    }
]

