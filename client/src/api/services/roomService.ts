import { apiClient } from "../client";

class RoomService {
  private getUrl(endPoint: string) {
    return `rooms/${endPoint}`;
  }
  createRoom({
    maxRound,
    themeSelectTime,
    roundTime,
    category,
    isCompetitive,
    isPrivate,
  }: {
    maxRound: number;
    themeSelectTime: number;
    roundTime: number;
    category: string;
    isCompetitive: boolean;
    isPrivate: boolean;
  }) {
    return apiClient.post(this.getUrl(""), {
      isCompetitive,
      category,
      maxRound,
      roundTime,
      themeSelectTime,
      isPrivate,
    });
  }
  connectFreeDraw(isCompetitive: boolean) {
    return apiClient.post(this.getUrl("free"), { isCompetitive });
  }
  connectQuickGame() {
    return apiClient.post(this.getUrl("quick"));
  }
}

export const roomService = new RoomService();
