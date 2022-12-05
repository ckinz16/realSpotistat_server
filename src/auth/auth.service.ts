import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './auth.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly spotifyScopes = 'user-read-playback-state user-read-currently-playing';
  private readonly clientId = this.config.get<string>('CLIENT_ID');
  private readonly clientSecret = this.config.get<string>('CLIENT_SECRET');
  private readonly redirectUri = this.config.get<string>('REDIRECT_URI');
  
  constructor(
    private readonly config: ConfigService,

    private readonly http: HttpService,
    
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  getAuthUrl(): string {
    let resource = 'https://accounts.spotify.com/authorize?';
    resource += `client_id=${this.clientId}&`;
    resource += `response_type=code&`;
    resource += `state=hehehehehehehehehehehehehehehehe&`;
    resource += `scope=${this.spotifyScopes}&`;
    resource += `redirect_uri=${this.redirectUri}`;

    return resource;
  }

  async requestToken(code: string, isRefresh: boolean) {
    const resource = 'https://accounts.spotify.com/api/token';
    const params = new URLSearchParams();
    const redirectUri = this.config.get<string>('REDIRECT_URI');
    const basicAuthStr = `${this.clientId}:${this.clientSecret}`;

    params.append('redirect_uri', redirectUri);

    if (isRefresh) {
      params.append('refresh_token', code);
      params.append('grant_type', 'refresh_token');
    } else {
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(basicAuthStr)}`,
    };

    this.http.post(resource, params, { headers }).subscribe(
      async (res: any) => {
        let authData: AuthDocument = res.data;

        if (authData.refresh_token) {
          const refresh_token_doc = new this.authModel({
            refresh_token: authData.refresh_token,
            type: 'Refresh Token',
          });
          delete authData.refresh_token;
          await this.authModel.deleteMany({ type: 'Refresh Token' });
          await refresh_token_doc.save();
        }

        authData = new this.authModel({
          access_token: authData.access_token,
          type: 'Access Token',
        });
        await this.authModel.deleteMany({ type: 'Access Token' });
        await authData.save();
      },
      async (err: any) => {
        this.logger.error(err);
      },
    );
  }

  async getAccessToken(): Promise<string> {
    // TODO>> see if i can one liner this mofo
    const authRec: any = await this.authModel.collection.findOne({
      type: 'Access Token',
    });
    return authRec.access_token;
  }

  async refreshToken(): Promise<void> {
    const refreshDoc = await this.authModel.collection.findOne({
      type: 'Refresh Token',
    });
    const refreshToken = refreshDoc.refresh_token;
    await this.requestToken(refreshToken, true);
  }
}
