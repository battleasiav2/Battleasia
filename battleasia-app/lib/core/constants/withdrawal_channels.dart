class WithdrawalChannel {
  final String value;
  final String label;
  final String currency;

  const WithdrawalChannel({
    required this.value,
    required this.label,
    required this.currency,
  });
}

/// Matches battleasia.gg wallet withdrawal channels.
const kWithdrawalChannels = [
  WithdrawalChannel(value: 'BKash', label: 'BKash', currency: 'BDT'),
  WithdrawalChannel(value: 'Nagad', label: 'Nagad', currency: 'BDT'),
  WithdrawalChannel(value: 'Rocket', label: 'Rocket', currency: 'BDT'),
  WithdrawalChannel(value: 'UPI', label: 'UPI', currency: 'INR'),
  WithdrawalChannel(value: 'JazzCash', label: 'JazzCash', currency: 'PKR'),
  WithdrawalChannel(value: 'EasyPaisa', label: 'EasyPaisa', currency: 'PKR'),
  WithdrawalChannel(
    value: 'Bank Transfer',
    label: 'Bank Transfer',
    currency: 'USD',
  ),
];
