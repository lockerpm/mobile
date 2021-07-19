import { Collection } from './collection';

import { CollectionView } from '../view/collectionView';

import { Collection as CollectionDomain } from '../domain/collection';

export class CollectionWithId extends Collection {
    id: string;

    // Use build method instead of ctor so that we can control order of JSON stringify for pretty print
    build(o: CollectionView | CollectionDomain) {
        this.id = o.id;
        super.build(o);
    }
}
