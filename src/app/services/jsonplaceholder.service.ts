import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonplaceholderService {
	apiUrlUser: string = 'https://jsonplaceholder.typicode.com/users';
	apiUrlPost: string = 'https://jsonplaceholder.typicode.com/posts';

  constructor(
    private _httpClient: HttpClient
  ) {}

	getAllUsers() {
		return this._httpClient.get(this.apiUrlUser);
	}

	getAllPosts() {
		return this._httpClient.get(this.apiUrlPost);
	}
}
