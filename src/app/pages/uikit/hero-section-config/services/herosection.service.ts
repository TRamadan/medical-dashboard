import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HerosectionService {
    configUrl = environment.apiUrl;
    constructor(private http: HttpClient) {}

    //here is the function needed to get all hero section config
    getAllHeroSectionConfig() {
        return this.http.get(this.configUrl + '');
    }

    //here is the function needed to update the selected hero section config
    updateHeroSectionConfig(body: any) {
        return this.http.put(this.configUrl + '', body);
    }
}
