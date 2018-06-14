(function($, B) {
    'use strict';
    $.extend(true, B, {
        settings: {
            daterange: {
                locale: {
                    format: 'YYYY-MM-DD',
                    separator: ' - ',
                    applyLabel: 'Ok',
                    cancelLabel: 'Wyczyść',
                    fromLabel: 'Od',
                    toLabel: 'Do',
                    customRangeLabel: 'Zakres',
                    daysOfWeek: ['N', 'Pn', 'Wt', 'Śr', 'Cz', 'Pi', 'So'],
                    monthNames: [
                        'Styczeń',
                        'Luty',
                        'Marzec',
                        'Kwiecień',
                        'Maj',
                        'Czerwiec',
                        'Lipiec',
                        'Sierpień',
                        'Wrzesień',
                        'Październik',
                        'Listopad',
                        'Grudzień'
                    ],
                    firstDay: 1
                },
                periods: {
                    Dzisiaj: [moment(), moment()],
                    'Ostatni tydzień': [moment().subtract(6, 'days'), moment()],
                    'Ostatnie 30 dni': [moment().subtract(29, 'days'), moment()],
                    'Aktualny miesiąc': [moment().startOf('month'), moment().endOf('month')],
                    'Poprzedni miesiąc': [
                        moment()
                            .subtract(1, 'month')
                            .startOf('month'),
                        moment()
                            .subtract(1, 'month')
                            .endOf('month')
                    ],
                    'Ostatni kwartał': [
                        moment()
                            .subtract(2, 'month')
                            .startOf('month'),
                        moment().endOf('month')
                    ],
                    'Aktualny rok': [moment().startOf('year'), moment()]
                }
            }
        }
    });
})(jQuery, Bajt);
