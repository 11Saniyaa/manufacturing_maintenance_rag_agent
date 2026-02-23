import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp?: string;
}

export interface ChatRequest {
  query: string;
  machineId?: number;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  sendQuery(
    query: string, 
    machineId?: number, 
    conversationHistory?: ChatMessage[]
  ): Observable<ChatResponse> {
    const body: ChatRequest = { query, machineId, conversationHistory };
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/query`, body);
  }
}




