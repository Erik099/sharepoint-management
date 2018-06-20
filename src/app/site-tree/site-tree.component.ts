import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogOverviewExampleDialog } from './site-tree-modal.component';
import { Sites } from './../mock-sites';
// import { users } from './../mock-users';
import { AppService } from './../globaldata.service';
import { SiteRole } from './../enums';
import { Observable } from "rxjs/Rx"
import { Site, SiteAttestation } from './../site';
import { User, AttestationUser } from './../user';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-site-tree',
  templateUrl: './site-tree.component.html',
  styleUrls: ['./site-tree.component.css']
    //providers: [AppService]
})

export class SiteTreeComponent implements OnInit {
  
  contextUser: Observable<User>;
  list: Site[];
  siteContext: SiteAttestation;
  // attestationUsers;
  businessOwner: AttestationUser;
  siteOwner: AttestationUser;
  primaryAdmin: AttestationUser;
  secondaryAdmin: AttestationUser;
  showFullUrls = false;
  showModalOnLoad = false;
  showModalUserRoleID = null;
  private i = 0;
  //public users = users;
  public siteRole = SiteRole;
  firstName: string = null;
  animal: string;
  name: string;

  constructor(private appService: AppService, public dialog: MatDialog, private route: ActivatedRoute) {
    

  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
          console.info("PARAMS-FROM-SITE-TREEE: " + console.info(params));
          const spId = params['siteCollectionSpId'];
          const id = params['siteCollectionId'];
          const confirm = params['confirm'];
          //this.getMovie(id);
          if(id){
            this.Init(spId, id);
          }          
          if(params['confirmRole']){
            this.showModalOnLoad = true;
            this.showModalUserRoleID = params['confirmRole'];
          }
      }
    );
  }

  Init(spId: string, id: number){

    this.appService.GetSiteAttestation(spId, id).subscribe(attestation => {
      if(attestation){
        this.siteContext = attestation;
        this.list = attestation.Hierarchy;
        this.businessOwner = attestation.AttestationUsers.find(u => u.Role === 1);
        this.siteOwner = attestation.AttestationUsers.find(u => u.Role === 2);
        this.primaryAdmin = attestation.AttestationUsers.find(u => u.Role === 3);
        this.secondaryAdmin = attestation.AttestationUsers.find(u => u.Role === 4);
        console.info("ATTEST!: " + console.info(attestation));
        if(this.showModalOnLoad){
          let u = attestation.AttestationUsers.find(u => u.Role == this.showModalUserRoleID);
          this.openPeoplePicker(this.siteContext.Hierarchy[0], u);
        }
        
      }
    });
  }

  toggleInheritance(site){
    if(site.inheritOwnerAdmins){
      site.inheritOwnerAdmins = false;
    }else{
      site.inheritOwnerAdmins = true;
    }
    
    //this.setInheritance(this.list, null);
  }

  setSelectedSite(siteId){
    const x = this.findDFS(this.list, siteId);
    x.isSelected = true;
  }

  toggleFullUrls(e){
    if(e.checked){
      this.showFullUrls = true;
    }else{
      this.showFullUrls = false;
    }
  }

  openParent(parentSPID){

  }

  getParents(childSPID){
    const parents = [];
    const context = this.getSiteBySPID(this.list, childSPID);
    
    let i;

    for(i=context.length; i > 0; i--){
      let parent = this.getSiteBySPID(this.list, childSPID);
    }
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '500px',
      height: '500px',
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  openPeoplePicker(site, user): void {
    //console.log(item);
    let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '800px',
      height: '650px',
      data: { site: site, user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }

  getWidth(level) {
    const newLevel = level * 20;
    return newLevel + 'px';
    // console.log(newLevel);
  }

  toggleChildren(event, siteId) {
    // const x = this.list.find(a => a.id === siteId);
    const x = this.findDFS(this.list, siteId);

    if (x.isOpen) {
      x.isOpen = false;
      this.hideChildren(x);
    } else {
      x.isOpen = true;
      this.showChildren(x);
    }
    //this.setEvenOdd(1);
  }

  hideChildren(parent) {
    if (parent.SubSites) {
      parent.SubSites.forEach(c => {
        c.isVisible = false;
        if (c.SubSites) {
          this.hideChildren(c);
        }
      });
    }
  }

  showChildren(parent) {
    if (parent.SubSites) {
      parent.SubSites.forEach(c => {
        c.isVisible = true;
        if (c.SubSites) {
          this.showChildren(c);
        }
      });
    }
  }

  findDFS(objects, id) {
    for (let o of objects || []) {
      if (o.ID == id) return o
      const o_ = this.findDFS(o.SubSites, id);
      if (o_) return o_
    }
  }

  public getSiteBySPID(objects, id) {
    for (let o of objects || []) {
      if (o.SPID == id) return o
      const o_ = this.findDFS(o.SubSites, id);
      if (o_) return o_
    }
  }

}
