import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('getLoginUrl')
    getLoginUrl() {
        return this.authService.getAuthUrl();
    }
    
    @Get('spotify-redirect')
    spotRedirect(@Query('code') code: string) {
        return this.authService.requestToken(code, false);
    }
    
}
