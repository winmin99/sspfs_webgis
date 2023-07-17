### Using #during(propertyName, begin, end) in ol/format/filter

Regarding tools/webpack/webgis/javascript/maps/openlayers/feature/filter.js:92

'TimePeriod' tags inside 'During' filter needs GML3.2 namespace instead of GML.

Change `<TimePeriod xmlns="http://www.opengis.net/gml/3.2">`
To `<TimePeriod xmlns="http://www.opengis.net/gml">`

See [Schema documentation for temporal.xsd](https://www.mediamaps.ch/ogc/schemas-xsdoc/sld/1.1.0/temporal_xsd.html)

Usage in IntelliJ IDEA example (**Convert cURL to HTTP Request**)

` 
curl -X POST --location "http://localhost:8000/geoserver/yeongju_a/wfs"
    -H "Content-Type: text/plain"
    -d "<GetFeature xmlns=\"http://www.opengis.net/wfs/2.0\" service=\"WFS\" version=\"2.0.0\" outputFormat=\"application/json\"
            xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"
            xsi:schemaLocation=\"http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd\">
    <Query typeNames=\"yeongju_a:viw_wtl_pipe_lm\" srsName=\"EPSG:5187\">
        <PropertyName>geom</PropertyName>
        <PropertyName>레이어</PropertyName>
        <PropertyName>관리번호</PropertyName>
        <PropertyName>관라벨</PropertyName>
        <PropertyName>폐관일자</PropertyName>
        <PropertyName>시설물구분</PropertyName>
        <Filter xmlns=\"http://www.opengis.net/fes/2.0\">
            <During>
                <ValueReference>설치일자</ValueReference>
                <TimePeriod xmlns=\"http://www.opengis.net/gml/3.2\">
                    <begin>
                        <TimeInstant>
                            <timePosition>2008-01-01</timePosition>
                        </TimeInstant>
                    </begin>
                    <end>
                        <TimeInstant>
                            <timePosition>2009-01-01</timePosition>
                        </TimeInstant>
                    </end>
                </TimePeriod>
            </During>
        </Filter>
    </Query>
</GetFeature>"
`
