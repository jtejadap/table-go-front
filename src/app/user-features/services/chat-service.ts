import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  mensajesRestantes: number;
}

/** Consume POST /api/chat (el token JWT lo agrega jwtInterceptor). */
@Service()
export class ChatService {
  private http = inject(HttpClient);

  enviar(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>('/api/chat/message', req);
  }
}
