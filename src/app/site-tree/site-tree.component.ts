import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SiteTreeModalComponent } from './site-tree-modal.component';
import { AttestationHistoryComponent } from './../attestation-history/attestation-history.component';
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
})

export class SiteTreeComponent implements OnInit {
  
  contextUser: Observable<User>;
  list: Site[];
  siteContext: SiteAttestation;
  siteCollectionUrl: string;
  businessOwner: AttestationUser;
  siteOwner: AttestationUser;
  primaryAdmin: AttestationUser;
  secondaryAdmin: AttestationUser;
  admin: AttestationUser;
  showFullUrls = false;
  showModalOnLoad = false;
  showModalUserRoleID = null;
  modalHasLoaded = false;
  private i = 0;
  pastedUrl;
  public siteRole = SiteRole;
  firstName: string = null;
  name: string;
  showInstructions: boolean = false;
  searchByUrlValue;
  searchIsValid = true;
  siteIsLoaded = false;
  public isAdmin: boolean = false;
  public workflow;
  public siteCollectionAttestationStatus;
  public showInheritanceMessage = true;
  public isValidAttestationSite = false;

  constructor(private appService: AppService, public dialog: MatDialog, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(
      params => {
          const spId = params['siteCollectionSpId'];      
          const confirm = params['confirm'];
          
          if(spId){
            this.Init(spId);
          }else{
            let lastSiteSpId = this.appService.GetLastSiteLoadedSPID();
            if(lastSiteSpId){
              this.Init(lastSiteSpId);
            }            
          }

          if(params['confirmRole']){
            this.showModalOnLoad = true;
            this.showModalUserRoleID = params['confirmRole'];
          }
      }
    );

    this.appService.getLoggedInUser().subscribe(u => { 
      if(u){
        this.isAdmin = u.IsAdmin;
      }      
    });
  }

  Init(spId: string){
    this.appService.IsValidAttestationSite(spId).subscribe(isValid => {
      if(isValid && isValid == true){
        this.isValidAttestationSite = true;
        this.appService.GetSiteAttestation(spId).subscribe(attestation => {
          if(attestation){
            this.siteIsLoaded = true;
            this.siteContext = attestation;
            this.siteCollectionUrl = attestation.Site.Url;
            this.list = attestation.Hierarchy;
            this.businessOwner = attestation.AttestationUsers.find(u => u.Role === 1);
            this.siteOwner = attestation.AttestationUsers.find(u => u.Role === 2);
            this.primaryAdmin = attestation.AttestationUsers.find(u => u.Role === 3);
            this.secondaryAdmin = attestation.AttestationUsers.find(u => u.Role === 4);
            this.admin = attestation.AttestationUsers.find(u => u.Role === 5);
            this.workflow = attestation.ActiveWorkflow;
            this.siteCollectionAttestationStatus = this.appService.GetSiteCollectionAttestationStatus();
            if(this.workflow && this.workflow.DisableDate){
              this.workflow.DisableDate = this.appService.FormatDate(this.workflow.DisableDate, false);
            }    
            if(this.showModalOnLoad && !this.modalHasLoaded){
              let u = attestation.AttestationUsers.find(u => u.Role == this.showModalUserRoleID);
              this.modalHasLoaded = true;
              this.openPeoplePicker(this.siteContext.Hierarchy[0], u);
            }        
          }
        });
      }else{
        this.siteIsLoaded = false;
      }
    });
  }

  SearchByUrl(url: string){
    this.appService.GetSiteAttestationByUrl(url).subscribe(attestation => {
      if(attestation){
        this.siteIsLoaded = true;
        this.siteContext = attestation;
        this.siteCollectionUrl = attestation.Site.Url;
        this.list = attestation.Hierarchy;
        this.businessOwner = attestation.AttestationUsers.find(u => u.Role === 1);
        this.siteOwner = attestation.AttestationUsers.find(u => u.Role === 2);
        this.primaryAdmin = attestation.AttestationUsers.find(u => u.Role === 3);
        this.secondaryAdmin = attestation.AttestationUsers.find(u => u.Role === 4);
        this.admin = attestation.AttestationUsers.find(u => u.Role === 5);
        this.workflow = attestation.ActiveWorkflow;
        this.siteCollectionAttestationStatus = this.appService.GetSiteCollectionAttestationStatus();
        
        if(this.workflow && this.workflow.DisableDate){
          this.workflow.DisableDate = this.appService.FormatDate(this.workflow.DisableDate, false);
        }
        
        if(this.showModalOnLoad && !this.modalHasLoaded){
          let u = attestation.AttestationUsers.find(u => u.Role == this.showModalUserRoleID);
          this.modalHasLoaded = true;
          this.openPeoplePicker(this.siteContext.Hierarchy[0], u);
        }        
      }else{
        this.searchIsValid = false;
      }
    });
  }

  Search(e){
    this.SearchByUrl(e.srcElement.value);    
  }

  toggleInheritance(site){
    if(site.inheritOwnerAdmins){
      site.inheritOwnerAdmins = false;
    }else{
      site.inheritOwnerAdmins = true;
    }
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

  getParents(childSPID){
    const parents = [];
    const context = this.getSiteBySPID(this.list, childSPID);
    
    let i;

    for(i=context.length; i > 0; i--){
      let parent = this.getSiteBySPID(this.list, childSPID);
    }
  }

  openPeoplePicker(site, user): void {
    let dialogRef = this.dialog.open(SiteTreeModalComponent, {
      width: '850px',
      height: '700px',
      data: { site: site, user: user }
    });

    dialogRef.afterClosed().subscribe(result => {
      dialogRef = null;
    });
  }

  OpenAttestationHistory(roleId: number): void {
    
    let dialogRef = this.dialog.open(AttestationHistoryComponent, {
      width: '850px',
      height: '700px',
      data: { site: this.siteContext.Site.SiteID, role: roleId }
    });

    dialogRef.afterClosed().subscribe(result => {  
      dialogRef = null;
    
    });
  }

  getWidth(level) {
    const newLevel = level * 20;
    return newLevel + 'px';
  }

  toggleChildren(event, siteId) {
    this.showInheritanceMessage = false;
    const x = this.findDFS(this.list, siteId);

    if (x.isOpen) {
      x.isOpen = false;
      this.hideChildren(x);
    } else {
      x.isOpen = true;
      this.showChildren(x);
    }    
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
