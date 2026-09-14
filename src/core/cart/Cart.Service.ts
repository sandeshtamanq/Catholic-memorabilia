import { Injectable } from '@nestjs/common';

export interface CartItem {
  id: string;
  productId?: number | string;
  name?: string;
  price?: number;
  quantity: number;
}

@Injectable()
export class CartService {
  private readonly guestCarts = new Map<string, CartItem[]>();
  private readonly userCarts = new Map<number, CartItem[]>();

  setGuestCart(guestId: string, items: CartItem[] = []): CartItem[] {
    const normalized = this.normalize(items);
    this.guestCarts.set(guestId, normalized);
    return normalized;
  }

  getGuestCart(guestId?: string): CartItem[] {
    if (!guestId) {
      return [];
    }

    return this.normalize(this.guestCarts.get(guestId) ?? []);
  }

  setUserCart(userId: number, items: CartItem[] = []): CartItem[] {
    const normalized = this.normalize(items);
    this.userCarts.set(userId, normalized);
    return normalized;
  }

  getUserCart(userId?: number): CartItem[] {
    if (!userId) {
      return [];
    }

    return this.normalize(this.userCarts.get(userId) ?? []);
  }

  addItemToGuestCart(guestId: string, item: CartItem): CartItem[] {
    const existing = this.getGuestCart(guestId);
    const updated = this.upsertItem(existing, item);
    return this.setGuestCart(guestId, updated);
  }

  addItemToUserCart(userId: number, item: CartItem): CartItem[] {
    const existing = this.getUserCart(userId);
    const updated = this.upsertItem(existing, item);
    return this.setUserCart(userId, updated);
  }

  mergeGuestCartIntoUser(guestId: string, userId: number): CartItem[] {
    const guestItems = this.getGuestCart(guestId);
    const userItems = this.getUserCart(userId);
    const merged = this.mergeItems(userItems, guestItems);
    this.userCarts.set(userId, merged);
    this.guestCarts.delete(guestId);
    return merged;
  }

  private normalize(items: CartItem[] = []): CartItem[] {
    return (items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity || 1),
    }));
  }

  private upsertItem(existing: CartItem[], item: CartItem): CartItem[] {
    const normalizedItem = {
      ...item,
      quantity: Number(item.quantity || 1),
    };
    const index = existing.findIndex(
      (entry) =>
        entry.id === normalizedItem.id ||
        (entry.productId != null &&
          normalizedItem.productId != null &&
          entry.productId === normalizedItem.productId),
    );

    if (index >= 0) {
      existing[index] = {
        ...existing[index],
        ...normalizedItem,
        quantity: existing[index].quantity + normalizedItem.quantity,
      };
      return existing;
    }

    return [...existing, normalizedItem];
  }

  private mergeItems(current: CartItem[], incoming: CartItem[]): CartItem[] {
    return incoming.reduce((merged, item) => this.upsertItem(merged, item), [
      ...current,
    ]);
  }
}
