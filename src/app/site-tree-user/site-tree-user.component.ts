import { Component, OnInit, OnChanges, Input, Output } from '@angular/core';
import { SiteTreeComponent } from './../site-tree/site-tree.component';
//import { sites } from './../state';
import { AppService } from './../globaldata.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {SiteTreeModalComponent} from './../site-tree/site-tree-modal.component';
import { SiteRole } from './../enums';
import { AttestationUser } from './../user';
import { Site } from './../site';
// import { IAppState } from './../store';
import { Observable } from "rxjs/Rx";
import { createSelector } from 'reselect';
import { SiteUserStatus } from './../enums';

@Component({
  selector: 'app-site-tree-user',
  templateUrl: './site-tree-user.component.html',
  styleUrls: ['./site-tree-user.component.css']
  //providers: [AppService]
})
export class SiteTreeUserComponent implements OnInit {
  @Input() user: AttestationUser;
  @Input() site: Site;

  contextSite: Site = null;
  url = null;
  role = SiteRole;
  public contextUser;
  public contextSiteUsersSiteId;
  siteUserStatus = SiteUserStatus;
  public roleName;

  constructor(private appService: AppService, public dialog: MatDialog) { 

  }

  openPeoplePicker(site, user): void {

    console.log(site);
    let dialogRef = this.dialog.open(SiteTreeModalComponent, {
      width: '800px',
      height: '700px',
      data: { site: site, user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit() {
      this.contextUser = this.user;
      this.contextSite = this.site;
      this.roleName = this.appService.GetSiteRoleNameByRoleID(this.user.Role);
  }
  
  testfunc(siteId: number){
    console.info("YO: " + siteId);
    this.appService.setTest(this.site);
  }
}
