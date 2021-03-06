import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  CreationModel,
  DeletionModel,
  GetNotesModel,
  GetTagsModel,
  PostNotesModel, UploadFileModel
} from '../models/crud-operations.model';
import {TagModel} from '../models/tag.model';
import {NoteModel} from '../models/note.model';
import {AuthorizationService} from './authorization.service';

const NAMESPACE = 'NTreeNotes';

@Injectable({providedIn: 'root'})
export class CrudService {

  constructor(private http: HttpClient, private authorizationService: AuthorizationService) {
  }

  public urlapi = 'https://ntree.online/proxy/NTreeNotesServer/api';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    withCredentials: true,
  };

  public GetNotes(text: string, tags: string[], offset = 0, countMax = 20): Observable<NoteModel[]> {
    const postBody: PostNotesModel = {
      namespace: NAMESPACE,
      actionId: 'find',
      object: {text, tags},
      options: {offset, countMax}
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions).pipe(
      map((data: GetNotesModel) => {
        return data.object.map((note: NoteModel) => {
          return {
            ...note,
            image_url: !note.image_url ? '' : `http://ntree.online/${note.image_url}`,
          };
        });
      }));
  }

  public GetNote(id): Observable<NoteModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'read',
      objectId: [id]
    };
    return this.http
      .post(this.urlapi, postBody, this.httpOptions)
      .pipe(map((data: GetNotesModel) => data.object[0]));
  }

  public GetTags(): Observable<TagModel[]> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'find',
      object: {
        type: 'tag'
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map((data: GetTagsModel) => data && data.object));
  }

  public AddNote(title, text, tags): Observable<CreationModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'create',
      objectId: 'fc3_20200326_XdBAcER1CHo8Y498',
      object: {
        type: 'note',
        title,
        text,
        tags
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<CreationModel>;
  }

  public UpdateNote(id, title, text, tags, files): Observable<CreationModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'update',
      objectId: id,
      object: {
        type: 'note',
        title,
        text,
        files,
        tags
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<CreationModel>;
  }

  public DeleteNote(id): Observable<DeletionModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'delete',
      objectId: id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<DeletionModel>;
  }

  public DeleteTag(id): Observable<DeletionModel> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'delete',
      objectId: id
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<DeletionModel>;
  }

  public AddTag(text): Observable<{ objectId: string, ok: boolean }> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'create',
      object: {
        type: 'tag',
        title: text
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions) as Observable<{ objectId: string, ok: boolean }>;
  }

  public UploadFile(formdata): Observable<UploadFileModel> {
    const uploadOptions = {
      headers: new HttpHeaders({
        'X-SourceId': this.authorizationService.uploadTicketId,
      })
    };
    return this.http.post('https://ntree.online/upload', formdata, uploadOptions) as Observable<UploadFileModel>;
  }

  public SaveFile(Fileid): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'create',
      object: {
        id: Fileid,
        type: 'file',
        title: Fileid
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok']) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }

  public SaveFileToNote(FileId, NoteId): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'update',
      objectId: NoteId,
      object: {
        files: [FileId]
      }
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok']) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }

  public DeleteFile(FileId): Observable<object> {
    const postBody = {
      namespace: NAMESPACE,
      actionId: 'delete',
      objectId: FileId
    };
    return this.http.post(this.urlapi, postBody, this.httpOptions)
      .pipe(map(data => {
        if (data['ok'] === true) {
          return data;
        } else {
          return data['ok'] = false;
        }
      }));
  }
}
