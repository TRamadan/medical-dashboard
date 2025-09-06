import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PartnersService {
    configUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}

    //here is the function needed to add a new partner
    saveNewPartner(body: any) {
        return this.http.post(this.configUrl + 'Partner', body);
    }

    //here is the function needed to get all partners
    getAllPartners() {
        return this.http.get(this.configUrl + 'Partner');
    }

    //here is the function needed to update the selected partner
    updatePartner(body: any) {
        return this.http.put(this.configUrl + 'Partner', body);
    }

    //here is the function needed to delete the selected partner
    deletePartner(id: any) {
        return this.http.delete(this.configUrl + 'Partner/' + id);
    }
}
