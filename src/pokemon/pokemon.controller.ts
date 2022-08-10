import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.pokemonService.findAll(paginationDto);
  }

  @Get(':pokemonId')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('pokemonId') pokemonId: string) {
    return this.pokemonService.findOne(pokemonId);
  }

  @Patch(':pokemonId')
  update(
    @Param('pokemonId') pokemonId: string,
    @Body() updatePokemonDto: UpdatePokemonDto,
  ) {
    return this.pokemonService.update(pokemonId, updatePokemonDto);
  }

  @Delete(':pokemonId')
  remove(@Param('pokemonId', ParseMongoIdPipe) pokemonId: string) {
    return this.pokemonService.remove(pokemonId);
  }
}
