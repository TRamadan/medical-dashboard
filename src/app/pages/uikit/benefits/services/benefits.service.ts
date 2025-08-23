import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class BenefitsService {
    configUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}

    //here is the function needed to get all hero section config
    getAllBenefits() {
        return this.http.get(this.configUrl + 'Benefit');
    }

    //here is the function needed to add a new benefit
    saveNewBenefit(body: any) {
        return this.http.post(this.configUrl + 'Benefit', body);
    }

    //here is the function needed to update the selected benefit
    updateBenefit(body: any) {
        return this.http.put(this.configUrl + 'Benefit', body);
    }

    //here is the function needed to add a delete selected benefit
    deleteBenefit(body: any) {
        return this.http.delete(this.configUrl + 'Benefit', body);
    }
}
