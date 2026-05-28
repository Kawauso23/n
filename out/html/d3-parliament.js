/*
 * Korean Election Parliament Chart
 * Modified for:
 * - 총선 (assembly)
 * - 대선 (president)
 * - 지선 (local)
 *
 * Based on Geoffrey Brossard parliament layout
 */

d3.koreaElection = function() {

    /* 모드
     * assembly  : 총선 반원 의석
     * president : 대선 득표 막대
     * local     : 지선 지도 색상
     */
    var mode = "assembly";

    /* 크기 */
    var width;
    var height;

    /* 총선 반원 비율 */
    var innerRadiusCoef = 0.4;

    /* 대한민국 정당 */
    const partyNames = {
        PPP: "국민의힘",
        DPK: "더불어민주당",
        RKP: "조국혁신당",
        RP: "개혁신당",
        TPP: "진보당",
        FNI: "자유와혁신",
        IND: "무소속"
    };

    /* 정당 색상 */
    const partyColors = {
        PPP: "#e61e2b",
        DPK: "#004ea2",
        RKP: "#6dd3ff",
        RP: "#ff7210",
        TPP: "#8b0000",
        FNI: "#111111",
        IND: "#808080"
    };

    function chart(selection) {

        selection.each(function(data) {

            const svg = d3.select(this);

            svg.selectAll("*").remove();

            width = width || this.getBoundingClientRect().width;
            height = height || width / 2;

            /*
             * =========================
             * 대선
             * =========================
             */

            if (mode === "president") {

                const totalVotes =
                    d3.sum(data, d => d.votes);

                let currentX = 0;

                svg.attr("width", width)
                    .attr("height", 120);

                svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")

                    .attr("x", function(d) {

                        const x = currentX;

                        currentX +=
                            (d.votes / totalVotes) * width;

                        return x;
                    })

                    .attr("y", 20)

                    .attr(
                        "width",
                        d => (d.votes / totalVotes) * width
                    )

                    .attr("height", 60)

                    .attr(
                        "fill",
                        d => partyColors[d.party]
                    );

                svg.selectAll("text")
                    .data(data)
                    .enter()
                    .append("text")

                    .attr("x", function(d, i) {

                        let prev = 0;

                        for (let j = 0; j < i; j++) {
                            prev +=
                                (data[j].votes / totalVotes)
                                * width;
                        }

                        return prev +
                            ((d.votes / totalVotes)
                            * width / 2);
                    })

                    .attr("y", 55)

                    .attr("fill", "#ffffff")

                    .attr("text-anchor", "middle")

                    .attr("font-size", "14px")

                    .text(d =>
                        partyNames[d.party]
                    );

                return;
            }

            /*
             * =========================
             * 지선
             * =========================
             */

            if (mode === "local") {

                /*
                 * data example:
                 *
                 * [
                 *   {
                 *      name: "서울",
                 *      party: "DPK",
                 *      x: 250,
                 *      y: 120
                 *   }
                 * ]
                 */

                svg.attr("width", width)
                    .attr("height", 600);

                svg.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect")

                    .attr("x", d => d.x)
                    .attr("y", d => d.y)

                    .attr("width", 60)
                    .attr("height", 40)

                    .attr(
                        "fill",
                        d => partyColors[d.party]
                    )

                    .attr("stroke", "#ffffff");

                svg.selectAll("text")
                    .data(data)
                    .enter()
                    .append("text")

                    .attr("x", d => d.x + 30)
                    .attr("y", d => d.y + 25)

                    .attr("text-anchor", "middle")
                    .attr("fill", "#ffffff")

                    .text(d => d.name);

                return;
            }

            /*
             * =========================
             * 총선
             * =========================
             */

            data.sort((a, b) => b.seats - a.seats);

            var outerParliamentRadius =
                Math.min(width / 2, height);

            var innerParliamentRadius =
                outerParliamentRadius
                * innerRadiusCoef;

            /*
             * 총 의석 수
             */

            var nSeats = 0;

            data.forEach(function(p) {
                nSeats += p.seats;
            });

            /*
             * 줄 계산
             */

            var nRows = 0;
            var maxSeatNumber = 0;
            var b = 0.5;

            (function() {

                var a =
                    innerRadiusCoef
                    / (1 - innerRadiusCoef);

                while (maxSeatNumber < nSeats) {

                    nRows++;

                    b += a;

                    maxSeatNumber =
                        series(
                            function(i) {
                                return Math.floor(
                                    Math.PI * (b + i)
                                );
                            },
                            nRows - 1
                        );
                }

            })();

            /*
             * 좌석 생성
             */

            var rowWidth =
                (outerParliamentRadius
                - innerParliamentRadius)
                / nRows;

            var seats = [];

            (function() {

                var seatsToRemove =
                    maxSeatNumber - nSeats;

                for (var i = 0; i < nRows; i++) {

                    var rowRadius =
                        innerParliamentRadius
                        + rowWidth * (i + 0.5);

                    var rowSeats =
                        Math.floor(Math.PI * (b + i))
                        - Math.floor(seatsToRemove / nRows)
                        - (
                            seatsToRemove % nRows > i
                            ? 1
                            : 0
                        );

                    var anglePerSeat =
                        Math.PI / rowSeats;

                    for (var j = 0; j < rowSeats; j++) {

                        var s = {};

                        s.polar = {
                            r: rowRadius,
                            teta:
                                -Math.PI
                                + anglePerSeat
                                * (j + 0.5)
                        };

                        s.cartesian = {
                            x:
                                s.polar.r
                                * Math.cos(s.polar.teta),

                            y:
                                s.polar.r
                                * Math.sin(s.polar.teta)
                        };

                        seats.push(s);
                    }
                }

            })();

            /*
             * 정렬
             */

            seats.sort(function(a, b) {

                return (
                    a.polar.teta - b.polar.teta
                    || b.polar.r - a.polar.r
                );
            });

            /*
             * 정당 배치
             */

            (function() {

                var partyIndex = 0;
                var seatIndex = 0;

                seats.forEach(function(s) {

                    var party = data[partyIndex];

                    if (seatIndex >= party.seats) {

                        partyIndex++;
                        seatIndex = 0;

                        party = data[partyIndex];
                    }

                    s.party = party;

                    seatIndex++;
                });

            })();

            /*
             * SVG
             */

            svg.attr("width", width)
                .attr("height", height);

            const container =
                svg.append("g")
                .attr(
                    "transform",
                    "translate("
                    + width / 2
                    + ","
                    + outerParliamentRadius
                    + ")"
                );

            /*
             * 좌석
             */

            container.selectAll("circle")
                .data(seats)
                .enter()
                .append("circle")

                .attr(
                    "cx",
                    d => d.cartesian.x
                )

                .attr(
                    "cy",
                    d => d.cartesian.y
                )

                .attr(
                    "r",
                    rowWidth * 0.4
                )

                .attr(
                    "fill",
                    d =>
                        partyColors[d.party.id]
                )

                .attr(
                    "stroke",
                    "#ffffff"
                )

                .on("mouseover", function(event, d) {

                    d3.select(this)
                        .attr("stroke", "#000000")
                        .attr("stroke-width", 2);
                })

                .on("mouseout", function() {

                    d3.select(this)
                        .attr("stroke", "#ffffff")
                        .attr("stroke-width", 1);
                });

            /*
             * 범례
             */

            const legend =
                svg.append("g")
                .attr(
                    "transform",
                    "translate(20,20)"
                );

            data.forEach(function(d, i) {

                const row = legend
                    .append("g")
                    .attr(
                        "transform",
                        "translate(0,"
                        + (i * 22)
                        + ")"
                    );

                row.append("rect")
                    .attr("width", 14)
                    .attr("height", 14)
                    .attr(
                        "fill",
                        partyColors[d.id]
                    );

                row.append("text")
                    .attr("x", 20)
                    .attr("y", 12)

                    .text(
                        partyNames[d.id]
                        + " "
                        + d.seats
                    );
            });
        });
    }

    /*
     * setter
     */

    chart.mode = function(value) {

        if (!arguments.length) return mode;

        mode = value;

        return chart;
    };

    chart.width = function(value) {

        if (!arguments.length) return width;

        width = value;

        return chart;
    };

    chart.height = function(value) {

        if (!arguments.length) return height;

        height = value;

        return chart;
    };

    chart.innerRadiusCoef = function(value) {

        if (!arguments.length)
            return innerRadiusCoef;

        innerRadiusCoef = value;

        return chart;
    };

    return chart;

    /*
     * util
     */

    function series(s, n) {

        var r = 0;

        for (var i = 0; i <= n; i++) {
            r += s(i);
        }

        return r;
    }
};
