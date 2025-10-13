import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class MethodologyService {
    configUrl = environment.apiUrlWebsite;
    constructor(private http: HttpClient) {}

    //here is the function needed to add a new Methodology
    saveNewMethodology(body: any) {
        return this.http.post(this.configUrl + 'Methodology', body);
    }

    //here is the function needed to get all Methodologys
    getAllMethodologies() {
        return this.http.get(this.configUrl + 'Methodology');
    }

    //here is the function needed to update the selected Methodology
    updateMethodology(body: any) {
        return this.http.put(this.configUrl + 'Methodology', body);
    }

    //here is the function needed to delete the selected Methodology
    deleteMethodology(id: any) {
        return this.http.delete(this.configUrl + 'Methodology/' + id);
    }
}
