/*
 * Multi-party line graph
 * Korean political party version
 */

function addMonths(date, months) {
    date = new Date(date);

    var d = date.getDate();

    date.setMonth(date.getMonth() + months);

    if (date.getDate() != d) {
        date.setDate(0);
    }

    return date;
}

d3.linegraph = function(
    noTicks,
    noDots,
    parties,
    partyColors,
    partyNames,
    dataMax,
    dataMin,
    additionalMonths
) {

    /* 기본 정당 설정 */
    if (!parties) {
        parties = ['PPP', 'DPK', 'FNI', 'TPP', 'RP', 'RKP'];
    }

    /* 정당 색상 */
    if (!partyColors) {
        partyColors = {
            'PPP': '#ff0000',   // 국민의힘
            'DPK': '#1e3a8a',   // 더불어민주당
            'FNI': '#000000',   // 자유와혁신
            'TPP': '#8b0000',   // 진보당
            'RP': '#ff8800',    // 개혁신당
            'RKP': '#87ceeb'    // 조국혁신당
        };
    }

    /* 그래프에 표시될 이름 */
    if (!partyNames) {
        partyNames = {
            'PPP': '국민의힘',
            'DPK': '더불어민주당',
            'FNI': '자유와혁신',
            'TPP': '진보당',
            'RP': '개혁신당',
            'RKP': '조국혁신당'
        };
    }

    if (!additionalMonths) {
        additionalMonths = 10;
    }

    /* 그래프 크기 */
    var width = 500;
    var height = 400;

    /* 여백 */
    var marginTop = 20;
    var marginRight = 20;
    var marginBottom = 50;
    var marginLeft = 40;

    function linegraph(dataset) {

        dataset.each(function(data) {

            /* 날짜 배열 */
            const dates = data.map(d => new Date(d.date));

            /* 정당별 시리즈 생성 */
            const series = parties.map(party =>
                data.map(d => ({
                    x: new Date(d.date),
                    y: d[party],
                    series: party
                }))
            );

            /* 최대 날짜 */
            const maxDate = d3.max(dates);

            /* X축 스케일 */
            const xScale = d3.scaleUtc(
                [new Date(2024, 0), addMonths(maxDate, additionalMonths)],
                [marginLeft, width - marginRight]
            );

            /* X축 */
            var xaxis = d3.axisBottom()
                .tickFormat(d3.timeFormat('%b %Y'))
                .tickValues(dates)
                .scale(xScale);

            if (noTicks) {
                xaxis = d3.axisBottom()
                    .tickFormat(d3.timeFormat('%b %Y'))
                    .ticks(10)
                    .scale(xScale);
            }

            /* Y축 최대값 자동 계산 */
            if (!dataMax) {

                const maxValue = d3.max(data, d =>
                    d3.max(parties, party => d[party])
                );

                dataMax = maxValue + 10;
                dataMin = 0;
            }

            /* Y축 스케일 */
            const yScale = d3.scaleLinear(
                [dataMin, dataMax],
                [height - marginBottom, marginTop]
            );

            /* SVG 선택 */
            var svg = d3.select(this);

            /* X축 그리기 */
            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(xaxis)
                .selectAll("text")
                .attr("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "0.1em")
                .attr("transform", "rotate(-30)");

            /* Y축 그리기 */
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(yScale));

            /* 라인 생성 함수 */
            const partyLine = (party) => d3.line()
                .x(d => xScale(new Date(d.date)))
                .y(d => yScale(d[party]));

            /* 라인 그리기 */
            for (const party of parties) {

                svg.append("path")
                    .attr("fill", "none")
                    .attr("stroke", partyColors[party])
                    .attr("stroke-width", 1.5)
                    .attr("class", party + " party-line")
                    .attr("id", party + "-line")
                    .attr("series", party)
                    .attr("d", partyLine(party)(data))

                    .on("mouseover", function() {

                        d3.selectAll(".party-line")
                            .attr("stroke-width", 0.1);

                        d3.selectAll(".party-node")
                            .attr("fill-opacity", 0.1);

                        d3.selectAll(".party-label")
                            .attr("opacity", 0.1);

                        d3.selectAll("." + party + "-node")
                            .attr("fill-opacity", 1);

                        d3.selectAll("." + party + "-label")
                            .attr("opacity", 1);

                        d3.select(this)
                            .attr("stroke-width", 5);
                    })

                    .on("mouseout", function() {

                        d3.selectAll(".party-line")
                            .attr("stroke-width", 1.5);

                        d3.selectAll(".party-node")
                            .attr("fill-opacity", 1);

                        d3.selectAll(".party-label")
                            .attr("opacity", 1);
                    });
            }

            /* 점 그리기 */
            if (!noDots) {

                svg.selectAll(".series")
                    .data(series)
                    .enter()
                    .append("g")

                    .selectAll(".point")
                    .data(d => d)
                    .enter()

                    .append("circle")
                    .attr("class", d =>
                        d.series + " " +
                        d.series + "-node " +
                        "party-node"
                    )

                    .attr("fill", d => partyColors[d.series])
                    .attr("series", d => d.series)

                    .attr("r", 4)

                    .attr("cx", d => xScale(d.x))
                    .attr("cy", d => yScale(d.y))

                    .on("mouseover", function() {

                        const node = d3.select(this);

                        const series = node.attr('series');

                        d3.selectAll(".party-line")
                            .attr("stroke-width", 0.1);

                        d3.selectAll(".party-node")
                            .attr("fill-opacity", 0.1);

                        d3.selectAll(".party-label")
                            .attr("opacity", 0.1);

                        d3.selectAll("." + series + "-node")
                            .attr("fill-opacity", 1);

                        d3.selectAll("#" + series + "-line")
                            .attr("stroke-width", 5);

                        d3.selectAll("." + series + "-label")
                            .attr("opacity", 1);
                    })

                    .on("mouseout", function() {

                        d3.selectAll(".party-line")
                            .attr("stroke-width", 1.5);

                        d3.selectAll(".party-node")
                            .attr("fill-opacity", 1);

                        d3.selectAll(".party-label")
                            .attr("opacity", 1);
                    });
            }

            /* 오른쪽 라벨 */
            svg.selectAll(".labels")
                .data(series)
                .enter()

                .append("text")

                .text(s => partyNames[s[0].series])

                .attr("series", s => s[0].series)

                .attr("font-size", "0.8em")

                .attr(
                    "class",
                    s => s[0].series + "-label party-label"
                )

                .attr(
                    "x",
                    s => xScale(s[s.length - 1].x) + 15
                )

                .attr(
                    "y",
                    s => yScale(s[s.length - 1].y) + 5
                )

                .on("mouseover", function() {

                    const text = d3.select(this);

                    const series = text.attr('series');

                    d3.selectAll(".party-line")
                        .attr("stroke-width", 0.1);

                    d3.selectAll(".party-node")
                        .attr("fill-opacity", 0.1);

                    d3.selectAll(".party-label")
                        .attr("opacity", 0.1);

                    d3.selectAll("." + series + "-node")
                        .attr("fill-opacity", 1);

                    d3.selectAll("#" + series + "-line")
                        .attr("stroke-width", 5);

                    d3.selectAll("." + series + "-label")
                        .attr("opacity", 1);
                })

                .on("mouseout", function() {

                    d3.selectAll(".party-line")
                        .attr("stroke-width", 1.5);

                    d3.selectAll(".party-node")
                        .attr("fill-opacity", 1);

                    d3.selectAll(".party-label")
                        .attr("opacity", 1);
                });

        });
    }

    /* width 설정 */
    linegraph.width = function(value) {

        if (!arguments.length) return width;

        width = value;

        return linegraph;
    };

    /* height 설정 */
    linegraph.height = function(value) {

        if (!arguments.length) return height;

        height = value;

        return linegraph;
    };

    /* parties 설정 */
    linegraph.parties = function(value) {

        if (!arguments.length) return parties;

        parties = value;

        return linegraph;
    };

    /* 이름 설정 */
    linegraph.partyNames = function(value) {

        if (!arguments.length) return partyNames;

        partyNames = value;

        return linegraph;
    };

    /* 색상 설정 */
    linegraph.partyColors = function(value) {

        if (!arguments.length) return partyColors;

        partyColors = value;

        return linegraph;
    };

    return linegraph;
};
