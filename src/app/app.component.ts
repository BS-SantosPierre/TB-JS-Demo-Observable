import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {  Component, OnInit } from '@angular/core';
import { catchError, delay, forkJoin, map, mergeMap, of, Subscription, tap, throwError } from 'rxjs';
import { JsonplaceholderService } from './services/jsonplaceholder.service';
import { UserPlaceholder } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {
	constructor(
		private readonly _http: HttpClient,
		private readonly _jsonPlaceholderService: JsonplaceholderService
	) {
	}

	subscriptionUser: Subscription = new Subscription();

	secretNumber!: number;
	user!: UserPlaceholder;
	loading: boolean = false;

	handleMap() {
		// Map => Permet de modifier l'observable en cours
		this.loading = true;
		this.subscriptionUser = this._http.get<UserPlaceholder[]>('https://jsonplaceholder.typicode.com/users')
			.pipe(
				delay(2000),
				map((users) => {
					const user = users[0];
					return user;
				}),
				catchError(this.handleError)
			)
			.subscribe({
				next: (user) => {
					this.user = user;
				},
				complete: () => {
					this.loading = false;
					this.subscriptionUser.unsubscribe();
				}
			})
	}

	handleError(res: HttpErrorResponse) {
		console.log(res);
		return throwError(() => console.log("Erreur"))
	}

	handleTap() {
		// Tap permet de manipuler des infos sans modifier l'observable
		// Souvent utilisé pour afficher la valeur de l'observable en cours
		of(1, 2, 3, 4)
			.pipe(
				tap((value) => {
					this.secretNumber = 6;
				}),
				map((nb) => {
					console.log(this.secretNumber);
					console.log(nb, "Hello");
					return nb;
				}),
				tap((value) => console.log(value, "AFTER"))
			)
			.subscribe({
				next: (nb) => {
					console.log(nb, "Hey");
				},
			});
	}

	handleErrorButton() {
		of(1, 2, 3, 4)
			.pipe(
				tap((nb) => {
					if (nb === 2) {
						throw new Error("Nombre invalide");
					}
				}),
				map((nb) => {
					return nb;
				}),
			)
			.subscribe({
				next: (nb) => {
					console.log(nb, "Hey");
				},
				error: (err) => {
					console.error(err.message);
				},
			});
	}

	handleMergeMap() {
		// Récupérer les posts d'un utilisateur
		// MERGE MAP => On a besoin d'attendre le résultat d'une première requête
		this._http.get('https://jsonplaceholder.typicode.com/users?username=Bret')
			.pipe(
				tap(console.log),
				map( users => {
					const user = users[0];
					return user;
				}),
				mergeMap((user) => {
					// Retourne un nouvelle observable sur le quel je peux m'inscrire
					return this._http.get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
				})
			)
			.subscribe({
				next: (posts) => {
					console.log(posts);
				},
				complete:() => {
					console.log("DONE");
				}
			})
	}

	handleForkJoin() {
		// Data Mapping => Mapper les userId avec leur nom
		// On veut attendre le résultat de plusieurs requête
		forkJoin([this._jsonPlaceholderService.getAllUsers(), this._jsonPlaceholderService.getAllPosts()])
			.pipe(
				map<any, any>(([users, posts]) => {
					return posts.map((post: any) => {
						return {
							...post,
							userId: users.find((user: any) => user.id === post.userId).name
						}
					})
				}),
			)
			.subscribe({
				next: (res) => {
					console.log(res);
				}
			})
	}

	handleForkJoinMergeMap() {
		// Plusieurs requêtes qui dépendent d'une autre
		// Récupérer les albums et posts d'un utilisateur
		this.userByName('Bret')
			.pipe(
				mergeMap((user) => {
					const posts = this._http.get(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`);
					const albums = this._http.get(`https://jsonplaceholder.typicode.com/albums?userId=${user.id}`);

					return forkJoin([posts, albums]);
				})
			).subscribe((result) => {
				console.log(result);
			})
	}

	userByName(name: string) {
		return this._http.get<UserPlaceholder[]>(`https://jsonplaceholder.typicode.com/users?username=${name}`)
			.pipe(
				map( users => {
					const user = users[0];
					return user;
				}));
	}

	ngOnInit(): void {
	}
}
