import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({ no: 1 });
  }

  // Es async porque debemos hacer conexion a la DB
  async findOne(pokemonId: string) {
    let pokemon: Pokemon;

    if (!isNaN(+pokemonId)) {
      pokemon = await this.pokemonModel.findOne({
        no: pokemonId,
      });
    }

    // verificar si es un Mongo Id
    // si isValidObjectId(pokemonId) -> pokemonId es el objeto de busqueda
    if (!pokemon && isValidObjectId(pokemonId)) {
      pokemon = await this.pokemonModel.findById(pokemonId);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: pokemonId.toLocaleLowerCase(),
      });
    }
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${pokemonId}" not found`,
      );
    }
    return pokemon;
  }

  async update(pokemonId: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(pokemonId);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    // Guardar en la DB
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }

    return updatePokemonDto;
  }

  async remove(pokemonId: string) {
    // const pokemon = await this.findOne( id );
    // await pokemon.deleteOne();
    // return { id };
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({
      _id: pokemonId,
    });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${pokemonId}" not found`);

    return;
  }

  // El handleExceptions nos ayudara a tener un listado completo de todos nuestros posibles errores
  // Estas son Exceptions no controladas
  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exist in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `We can't create Pokemon. Please, check the server log`,
    );
  }
}
