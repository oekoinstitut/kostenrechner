angular.module 'oekoKostenrechner'
  .constant 'MAIN',
    SHORTENER_INTERFACE: '//white-shortener.herokuapp.com'
    SHORTENER_PROVIDER: 'goo.gl',
    CHART_TYPE: 'spline'
    CHART_YAXIS: 'TCO'
    CHART_XAXIS: 'holding_time'
    COLORS: do ->
      base = ["#71BF44", "#00B8DE", "#DD291B", "#FDC900"]
      colors = []
      colors.push c for c in base
      colors.push d3.rgb(c).darker(1).toString() for c in base
      colors.push d3.rgb(c).darker(2).toString() for c in base
      colors
