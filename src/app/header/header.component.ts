import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'my-header',
  templateUrl: 'src/app/header/header.component.html',
  styleUrls: ['src/app/header/header.component.css']

})

export class HeaderComponent implements OnInit {
  @Input() title: string = "联系人";
  @Input() isShowCreateButton: boolean;

  constructor() {}

  ngOnInit() {

  }

}
