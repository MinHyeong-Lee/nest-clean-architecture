import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Headers,
  UseGuards,
  Inject,
  LoggerService,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserInfo } from './UserInfo';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth.guard';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<void> {
    this.printLoggerServiceLog(dto);
    const { name, email, password } = dto;
    await this.usersService.createUser(name, email, password);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    const { signupVerifyToken } = dto;

    return await this.usersService.verifyEmail(signupVerifyToken);
  }

  // @Post('/login')
  // async login(@Body() dto: UserLoginDto): Promise<string> {
  //   const { email, password } = dto;

  //   return await this.usersService.login(email, password);
  // }

  // @Get('/:id')
  // async getUserInfo(@Param('id') userId: string): Promise<UserInfo> {
  //   return await this.usersService.getUserInfo(userId);
  // }

  // @Get('/:id')
  // async findOne(@Param('id', ParseIntPipe) id: number) {
  //   console.log(typeof id);
  //   return await this.usersService.findOne(id);
  // }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserInfo(
    @Headers() headers: any,
    @Param('id') userId: string,
  ): Promise<UserInfo> {
    return this.usersService.getUserInfo(userId);
  }

  @Get('/db-host-from-config')
  getDatabaseHostFromConfigService(): string {
    return this.configService.get('DB_HOST');
  }

  private printLoggerServiceLog(dto) {
    try {
      throw new InternalServerErrorException('test');
    } catch (e) {
      this.logger.error('error: ' + JSON.stringify(dto), e.stack);
    }
    this.logger.warn('warn: ' + JSON.stringify(dto));
    this.logger.log('log: ' + JSON.stringify(dto));
    this.logger.verbose('verbose: ' + JSON.stringify(dto));
    this.logger.debug('debug: ' + JSON.stringify(dto));
  }
}
