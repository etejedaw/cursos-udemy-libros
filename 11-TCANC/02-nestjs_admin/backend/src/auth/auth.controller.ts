import {
	BadRequestException,
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	NotFoundException,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './models/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class AuthController {
	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService,
	) {}

	@Post('register')
	async register(@Body() body: RegisterDto) {
		const hashed = await bcrypt.hash(body.password, 12);
		return this.userService.create({
			firstName: body.firstName,
			lastName: body.lastName,
			email: body.email,
			password: hashed,
		});
	}

	@Post('login')
	async login(
		@Body('email') email: string,
		@Body('password') password: string,
		@Res({ passthrough: true }) response: Response,
	) {
		const user = await this.userService.findOne({ email });
		if (!user) throw new NotFoundException('User not found');

		const comparePassword = await bcrypt.compare(password, user.password);
		if (!comparePassword) throw new BadRequestException('Invalid Credentials');

		const jwt = await this.jwtService.signAsync({ id: user.id });

		response.cookie('jwt', jwt, { httpOnly: true });

		return user;
	}

	@UseGuards(AuthGuard)
	@Get('user')
	async user(@Req() request: Request) {
		const id = this.authService.userId(request);
		return this.userService.findOne({ id });
	}

	@UseGuards(AuthGuard)
	@Post('logout')
	async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('jwt');

		return {
			message: 'Success!',
		};
	}
}
