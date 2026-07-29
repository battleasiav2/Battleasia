import 'package:battleasia_app/data/models/match_history_model.dart';

class StatisticsItemModel {
  final String id;
  final String matchName;
  final String date;
  final double paid;
  final double won;

  StatisticsItemModel({
    required this.id,
    required this.matchName,
    required this.date,
    required this.paid,
    required this.won,
  });

  factory StatisticsItemModel.fromMatchHistory(
    MatchHistoryModel matchHistory,
  ) {
    return StatisticsItemModel(
      id: matchHistory.id,
      matchName: matchHistory.matchName ?? 'Unknown Match',
      date: matchHistory.matchSchedule ?? matchHistory.createdAt ?? '',
      paid: matchHistory.entryFee ?? 0.0,
      won: matchHistory.prizeWon,
    );
  }
}

