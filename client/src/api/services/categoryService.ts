import { apiClient } from "../client";

class CategoryService {
  private getUrl(endPoint: string) {
    return `categories/${endPoint}`;
  }

  getCategories() {
    return apiClient.get(this.getUrl(""), {});
  }
}

export const categoryService = new CategoryService();
