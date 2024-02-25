import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Post } from './model/PostModel';
import { catchError, map, tap } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  error = new Subject<string>();
  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };
    // Send Http request
    this.http
      .post<{ name: string }>(
        `https://ng-udemy-4cb13-default-rtdb.europe-west1.firebasedatabase.app/
    posts.json`,
        postData,
        {
          // observing the response
          observe: 'response',
        }
      )
      .subscribe(
        (responseData) => {
          console.log(responseData);
        },
        (error) => {
          this.error.next(error.message);
        }
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');

    // Send Http request
    return this.http
      .get<{ [key: string]: Post }>(
        `https://ng-udemy-4cb13-default-rtdb.europe-west1.firebasedatabase.app/
    posts.json`,
        {
          headers: new HttpHeaders({
            'Custom-Header': 'Hello',
          }),
          params: searchParams,
          responseType: 'json',
        }
      )
      .pipe(
        map((response) => {
          const postsArray: Post[] = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              postsArray.push({ ...response[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError((errorRes) => {
          // Send to analytics server
          return throwError(errorRes);
        })
      );
  }

  deletePosts() {
    return this.http
      .delete(
        `https://ng-udemy-4cb13-default-rtdb.europe-west1.firebasedatabase.app/
    posts.json`,
        {
          observe: 'events',
          responseType: 'text',
        }
      )
      .pipe(
        tap((event) => {
          console.log(event);
          if (event.type === HttpEventType.Sent) {
            console.log('Delete request successful!');
          }
          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
