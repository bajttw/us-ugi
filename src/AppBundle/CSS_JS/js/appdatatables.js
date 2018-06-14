DT.renders.state = function (data, type, full, meta) {
    var warning = '';
    if (data >= 4 && full.pg_alarm !== undefined && full.pg_alarm > 0) {
        warning = B.html.get('icon', {
            icon: 'warning',
            addClass: 'text-warning md-14',
            attr: {
                title: 'Istnieją pozycje zamówienia nie przyporządkowane do palet: ' + full.pg_alarm
            }

        });
    }
    return warning + DT.renders.dic(data, type, full, meta);
};