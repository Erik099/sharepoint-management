import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { LOGIN_USER, INIT_SITES } from './actions';
import { SharePointApi } from './api/sharePointApi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'app';
  profile = {};

  constructor(private spApi: SharePointApi){

  }

  ngOnInit(){
  }
}

