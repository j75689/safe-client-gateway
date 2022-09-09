import { Inject, Injectable } from '@nestjs/common';
import {
  cursorUrlFromLimitAndOffset,
  PaginationData,
} from '../../common/pagination/pagination.data';
import { IChainsRepository } from '../../domain/chains/chains.repository.interface';
import { IBackboneRepository } from '../../domain/backbone/backbone.repository.interface';
import { Page } from '../../domain/entities/page.entity';
import { Chain } from '../../domain/chains/entities/chain.entity';
import { Backbone } from '../../domain/backbone/entities/backbone.entity';

@Injectable()
export class ChainsService {
  constructor(
    @Inject(IChainsRepository)
    private readonly chainsRepository: IChainsRepository,
    @Inject(IBackboneRepository)
    private readonly backboneRepository: IBackboneRepository,
  ) {}

  async getChains(
    routeUrl: Readonly<URL>,
    paginationData?: PaginationData,
  ): Promise<Page<Chain>> {
    const result = await this.chainsRepository.getChains(
      paginationData?.limit,
      paginationData?.offset,
    );

    const nextURL = cursorUrlFromLimitAndOffset(routeUrl, result.next);
    const previousURL = cursorUrlFromLimitAndOffset(routeUrl, result.previous);

    return {
      count: result.count,
      next: nextURL?.toString(),
      previous: previousURL?.toString(),
      results: result.results.map(
        (chain) =>
          <Chain>{
            chainId: chain.chainId,
            chainName: chain.chainName,
            vpcTransactionService: chain.vpcTransactionService,
          },
      ),
    };
  }

  async getBackbone(chainId: string): Promise<Backbone> {
    return this.backboneRepository.getBackbone(chainId);
  }
}