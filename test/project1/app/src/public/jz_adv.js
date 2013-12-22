(function(VA,global){
if(!global.g_adsconfig){global.g_adsconfig = "";}

  var VA = VA || (global.VA = {});
  VA.VAD = function (pageid){
    var pageid = pageid;
    var config = {
      'api': 'http://crm.ws.ctrip.com/Customer-Market-Proxy/AdCallProxy.aspx?re=ads&adlist=',
      'partition': {
        1: [2, 14], //shanghai
        2: [7, 533, 479], //qingdao
        3: [144], //jinan
        4: [451, 523, 142, 5, 158], //shenyang
        5: [6], //dalian
        6: [25, 258, 406], //fujian
        7: [477, 376, 559], //wuhan
        8: [206], //changsha
        9: [1, 103, 428, 105, 141, 527, 140], //beijing
        10: [3], //tianjin
        11: [32, 43, 42, 447, 380, 31, 251, 553, 316], //guangdong
        12: [30, 223], //shenzhen
        13: [12, 512, 278, 13, 213], //jiangsu
        14: [17, 491, 578, 536], //zhejiang
        15: [375], //ningbo
        16: [28, 34, 494, 370, 109, 39, 100, 124, 41, 99, 38], //xinan
        17: [4], //chongqing
        18: [10] //xian
      },
      'pageKeyword': {
        'index': 1,
        'domestic': 2, //
        'international': 3, //
        'around': 4, //
        'cruise': 5, //
        'tickets': 6, //
        'car': 7, //
        'visa': 8, //
        'rebooking': 9, //
        'new_index': 10 //
      },
      'map': {
        '1-1': ['PanelAdBanner|1646-1647-1648-1649-1650', 'divJZAD1|1651', 'divJZAD2|1652', 'divJZAD3|1653'],
        '1-2': ['PanelAdBanner|2119-2120-2121-2122-2123', 'divJZAD1|2124', 'divJZAD2|2125', 'divJZAD3|2126'],
        '1-3': ['PanelAdBanner|2162-2163-2164-2165-2166', 'divJZAD1|2167', 'divJZAD2|2168', 'divJZAD3|2169'],
        '1-4': ['PanelAdBanner|2205-2206-2207-2208-2209', 'divJZAD1|2210', 'divJZAD2|2211', 'divJZAD3|2212'],
        '1-5': ['PanelAdBanner|2248-2249-2250-2251-2252', 'divJZAD1|2253', 'divJZAD2|2254', 'divJZAD3|2255'],
        '1-6': ['PanelAdBanner|2291-2292-2293-2294-2295', 'divJZAD1|2296', 'divJZAD2|2297', 'divJZAD3|2298'],
        '1-7': ['PanelAdBanner|1732-1733-1734-1735-1736', 'divJZAD1|1737', 'divJZAD2|1738', 'divJZAD3|1739'],
        '1-8': ['PanelAdBanner|2334-2335-2336-2337-2338', 'divJZAD1|2339', 'divJZAD2|2340', 'divJZAD3|2341'],
        '1-9': ['PanelAdBanner|1689-1690-1691-1692-1693', 'divJZAD1|1694', 'divJZAD2|1695', 'divJZAD3|1696'],
        '1-10': ['PanelAdBanner|1775-1776-1777-1778-1779', 'divJZAD1|1780', 'divJZAD2|1781', 'divJZAD3|1782'],
        '1-11': ['PanelAdBanner|1818-1819-1820-1821-1822', 'divJZAD1|1823', 'divJZAD2|1824', 'divJZAD3|1825'],
        '1-12': ['PanelAdBanner|1861-1862-1863-1864-1865', 'divJZAD1|1866', 'divJZAD2|1867', 'divJZAD3|1868'],
        '1-13': ['PanelAdBanner|1990-1991-1992-1993-1994', 'divJZAD1|1995', 'divJZAD2|1996', 'divJZAD3|1997'],
        '1-14': ['PanelAdBanner|1947-1948-1949-1950-1951', 'divJZAD1|1952', 'divJZAD2|1953', 'divJZAD3|1954'],
        '1-15': ['PanelAdBanner|1904-1905-1906-1907-1908', 'divJZAD1|1909', 'divJZAD2|1910', 'divJZAD3|1911'],
        '1-16': ['PanelAdBanner|2076-2077-2078-2079-2080', 'divJZAD1|2081', 'divJZAD2|2082', 'divJZAD3|2083'],
        '1-17': ['PanelAdBanner|2377-2378-2379-2380-2381', 'divJZAD1|2382', 'divJZAD2|2383', 'divJZAD3|2384'],
        '1-18': ['PanelAdBanner|2033-2034-2035-2036-2037', 'divJZAD1|2038', 'divJZAD2|2039', 'divJZAD3|2040'],

        '2-1': ['PanelAdBanner|1654-1655-1656', 'divJZAD1|1657', 'divJZAD2|1658', 'divJZAD3|1659'],
        '2-2': ['PanelAdBanner|2127-2128-2129', 'divJZAD1|2130', 'divJZAD2|2131', 'divJZAD3|2132'],
        '2-3': ['PanelAdBanner|2170-2171-2172', 'divJZAD1|2173', 'divJZAD2|2174', 'divJZAD3|2175'],
        '2-4': ['PanelAdBanner|2213-2214-2215', 'divJZAD1|2216', 'divJZAD2|2217', 'divJZAD3|2218'],
        '2-5': ['PanelAdBanner|2256-2257-2258', 'divJZAD1|2259', 'divJZAD2|2260', 'divJZAD3|2261'],
        '2-6': ['PanelAdBanner|2299-2300-2301', 'divJZAD1|2302', 'divJZAD2|2303', 'divJZAD3|2304'],
        '2-7': ['PanelAdBanner|1740-1741-1742', 'divJZAD1|1743', 'divJZAD2|1744', 'divJZAD3|1745'],
        '2-8': ['PanelAdBanner|2342-2343-2344', 'divJZAD1|2345', 'divJZAD2|2346', 'divJZAD3|2347'],
        '2-9': ['PanelAdBanner|1697-1698-1699', 'divJZAD1|1700', 'divJZAD2|1701', 'divJZAD3|1702'],
        '2-10': ['PanelAdBanner|1783-1784-1785', 'divJZAD1|1786', 'divJZAD2|1787', 'divJZAD3|1788'],
        '2-11': ['PanelAdBanner|1826-1827-1828', 'divJZAD1|1829', 'divJZAD2|1830', 'divJZAD3|1831'],
        '2-12': ['PanelAdBanner|1869-1870-1871', 'divJZAD1|1872', 'divJZAD2|1873', 'divJZAD3|1874'],
        '2-13': ['PanelAdBanner|1998-1999-2000', 'divJZAD1|2001', 'divJZAD2|2002', 'divJZAD3|2003'],
        '2-14': ['PanelAdBanner|1955-1956-1957', 'divJZAD1|1958', 'divJZAD2|1959', 'divJZAD3|1960'],
        '2-15': ['PanelAdBanner|1912-1913-1914', 'divJZAD1|1915', 'divJZAD2|1916', 'divJZAD3|1917'],
        '2-16': ['PanelAdBanner|2084-2085-2086', 'divJZAD1|2087', 'divJZAD2|2088', 'divJZAD3|2089'],
        '2-17': ['PanelAdBanner|2385-2386-2387', 'divJZAD1|2388', 'divJZAD2|2389', 'divJZAD3|2390'],
        '2-18': ['PanelAdBanner|2041-2042-2043', 'divJZAD1|2044', 'divJZAD2|2045', 'divJZAD3|2046'],

        '3-1': ['PanelAdBanner|1660-1661-1662', 'divJZAD1|1663', 'divJZAD2|1664', 'divJZAD3|1665'],
        '3-2': ['PanelAdBanner|2133-2134-2135', 'divJZAD1|2136', 'divJZAD2|2137', 'divJZAD3|2138'],
        '3-3': ['PanelAdBanner|2176-2177-2178', 'divJZAD1|2179', 'divJZAD2|2180', 'divJZAD3|2181'],
        '3-4': ['PanelAdBanner|2219-2220-2221', 'divJZAD1|2222', 'divJZAD2|2223', 'divJZAD3|2224'],
        '3-5': ['PanelAdBanner|2262-2263-2264', 'divJZAD1|2265', 'divJZAD2|2266', 'divJZAD3|2267'],
        '3-6': ['PanelAdBanner|2305-2306-2307', 'divJZAD1|2308', 'divJZAD2|2309', 'divJZAD3|2310'],
        '3-7': ['PanelAdBanner|1746-1747-1748', 'divJZAD1|1749', 'divJZAD2|1750', 'divJZAD3|1751'],
        '3-8': ['PanelAdBanner|2348-2349-2350', 'divJZAD1|2351', 'divJZAD2|2352', 'divJZAD3|2353'],
        '3-9': ['PanelAdBanner|1703-1704-1705', 'divJZAD1|1706', 'divJZAD2|1707', 'divJZAD3|1708'],
        '3-10': ['PanelAdBanner|1789-1790-1791', 'divJZAD1|1792', 'divJZAD2|1793', 'divJZAD3|1794'],
        '3-11': ['PanelAdBanner|1832-1833-1834', 'divJZAD1|1835', 'divJZAD2|1836', 'divJZAD3|1837'],
        '3-12': ['PanelAdBanner|1875-1876-1877', 'divJZAD1|1878', 'divJZAD2|1879', 'divJZAD3|1880'],
        '3-13': ['PanelAdBanner|2004-2005-2006', 'divJZAD1|2007', 'divJZAD2|2008', 'divJZAD3|2009'],
        '3-14': ['PanelAdBanner|1961-1962-1963', 'divJZAD1|1964', 'divJZAD2|1965', 'divJZAD3|1966'],
        '3-15': ['PanelAdBanner|1918-1919-1920', 'divJZAD1|1921', 'divJZAD2|1922', 'divJZAD3|1923'],
        '3-16': ['PanelAdBanner|2090-2091-2092', 'divJZAD1|2093', 'divJZAD2|2094', 'divJZAD3|2095'],
        '3-17': ['PanelAdBanner|2391-2392-2393', 'divJZAD1|2394', 'divJZAD2|2395', 'divJZAD3|2396'],
        '3-18': ['PanelAdBanner|2047-2048-2049', 'divJZAD1|2050', 'divJZAD2|2051', 'divJZAD3|2052'],

        '4-1': ['PanelAdBanner|1666-1667-1668', 'divJZAD1|1669', 'divJZAD2|1670', 'divJZAD3|1671'],
        '4-2': ['PanelAdBanner|2139-2140-2141', 'divJZAD1|2142', 'divJZAD2|2143', 'divJZAD3|2144'],
        '4-3': ['PanelAdBanner|2182-2183-2184', 'divJZAD1|2185', 'divJZAD2|2186', 'divJZAD3|2187'],
        '4-4': ['PanelAdBanner|2225-2226-2227', 'divJZAD1|2228', 'divJZAD2|2229', 'divJZAD3|2230'],
        '4-5': ['PanelAdBanner|2268-2269-2270', 'divJZAD1|2271', 'divJZAD2|2272', 'divJZAD3|2273'],
        '4-6': ['PanelAdBanner|2311-2312-2313', 'divJZAD1|2314', 'divJZAD2|2315', 'divJZAD3|2316'],
        '4-7': ['PanelAdBanner|1752-1753-1754', 'divJZAD1|1755', 'divJZAD2|1756', 'divJZAD3|1757'],
        '4-8': ['PanelAdBanner|2354-2355-2356', 'divJZAD1|2357', 'divJZAD2|2358', 'divJZAD3|2359'],
        '4-9': ['PanelAdBanner|1709-1710-1711', 'divJZAD1|1712', 'divJZAD2|1713', 'divJZAD3|1714'],
        '4-10': ['PanelAdBanner|1795-1796-1797', 'divJZAD1|1798', 'divJZAD2|1799', 'divJZAD3|1800'],
        '4-11': ['PanelAdBanner|1838-1839-1840', 'divJZAD1|1841', 'divJZAD2|1842', 'divJZAD3|1843'],
        '4-12': ['PanelAdBanner|1881-1882-1883', 'divJZAD1|1884', 'divJZAD2|1885', 'divJZAD3|1886'],
        '4-13': ['PanelAdBanner|2010-2011-2012', 'divJZAD1|2013', 'divJZAD2|2014', 'divJZAD3|2015'],
        '4-14': ['PanelAdBanner|1967-1968-1969', 'divJZAD1|1970', 'divJZAD2|1971', 'divJZAD3|1972'],
        '4-15': ['PanelAdBanner|1924-1925-1926', 'divJZAD1|1927', 'divJZAD2|1928', 'divJZAD3|1929'],
        '4-16': ['PanelAdBanner|2096-2097-2098', 'divJZAD1|2099', 'divJZAD2|2100', 'divJZAD3|2101'],
        '4-17': ['PanelAdBanner|2397-2398-2399', 'divJZAD1|2400', 'divJZAD2|2401', 'divJZAD3|2402'],
        '4-18': ['PanelAdBanner|2053-2054-2055', 'divJZAD1|2056', 'divJZAD2|2057', 'divJZAD3|2058'],

        '5-1': ['PanelAdBanner|1672-1673-1674-1675-1676', 'divJZAD1|1677', 'divJZAD2|1678', 'divJZAD3|1679'],
        '5-2': ['PanelAdBanner|2145-2146-2147-2148-2149', 'divJZAD1|2150', 'divJZAD2|2151', 'divJZAD3|2152'],
        '5-3': ['PanelAdBanner|2188-2189-2190-2191-2192', 'divJZAD1|2193', 'divJZAD2|2194', 'divJZAD3|2195'],
        '5-4': ['PanelAdBanner|2231-2232-2233-2234-2235', 'divJZAD1|2236', 'divJZAD2|2237', 'divJZAD3|2238'],
        '5-5': ['PanelAdBanner|2274-2275-2276-2277-2278', 'divJZAD1|2279', 'divJZAD2|2280', 'divJZAD3|2281'],
        '5-6': ['PanelAdBanner|2317-2318-2319-2320-2321', 'divJZAD1|2322', 'divJZAD2|2323', 'divJZAD3|2324'],
        '5-7': ['PanelAdBanner|1758-1759-1760-1761-1762', 'divJZAD1|1763', 'divJZAD2|1764', 'divJZAD3|1765'],
        '5-8': ['PanelAdBanner|2360-2361-2362-2363-2364', 'divJZAD1|2365', 'divJZAD2|2366', 'divJZAD3|2367'],
        '5-9': ['PanelAdBanner|1715-1716-1717-1718-1719', 'divJZAD1|1720', 'divJZAD2|1721', 'divJZAD3|1722'],
        '5-10': ['PanelAdBanner|1801-1802-1803-1804-1805', 'divJZAD1|1806', 'divJZAD2|1807', 'divJZAD3|1808'],
        '5-11': ['PanelAdBanner|1844-1845-1846-1847-1848', 'divJZAD1|1849', 'divJZAD2|1850', 'divJZAD3|1851'],
        '5-12': ['PanelAdBanner|1887-1888-1889-1890-1892', 'divJZAD1|1892', 'divJZAD2|1893', 'divJZAD3|1894'],
        '5-13': ['PanelAdBanner|2016-2017-2018-2019-2020', 'divJZAD1|2021', 'divJZAD2|2022', 'divJZAD3|2023'],
        '5-14': ['PanelAdBanner|1973-1974-1975-1976-1977', 'divJZAD1|1978', 'divJZAD2|1979', 'divJZAD3|1980'],
        '5-15': ['PanelAdBanner|1930-1931-1932-1933-1934', 'divJZAD1|1935', 'divJZAD2|1936', 'divJZAD3|1937'],
        '5-16': ['PanelAdBanner|2102-2103-2104-2105-2106', 'divJZAD1|2107', 'divJZAD2|2108', 'divJZAD3|2109'],
        '5-17': ['PanelAdBanner|2403-2404-2405-2406-2407', 'divJZAD1|2408', 'divJZAD2|2409', 'divJZAD3|2410'],
        '5-18': ['PanelAdBanner|2059-2060-2061-2062-2063', 'divJZAD1|2064', 'divJZAD2|2065', 'divJZAD3|2066'],

        '6-1': ['PanelAdBanner|1680-1681-1682', 'divJZAD1|1683', 'divJZAD2|1684', 'divJZAD3|1685'],
        '6-2': ['PanelAdBanner|2153-2154-2155', 'divJZAD1|2156', 'divJZAD2|2157', 'divJZAD3|2158'],
        '6-3': ['PanelAdBanner|2196-2197-2198', 'divJZAD1|2199', 'divJZAD2|2200', 'divJZAD3|2201'],
        '6-4': ['PanelAdBanner|2239-2240-2241', 'divJZAD1|2242', 'divJZAD2|2243', 'divJZAD3|2244'],
        '6-5': ['PanelAdBanner|2282-2283-2284', 'divJZAD1|2285', 'divJZAD2|2286', 'divJZAD3|2287'],
        '6-6': ['PanelAdBanner|2325-2326-2327', 'divJZAD1|2328', 'divJZAD2|2329', 'divJZAD3|2330'],
        '6-7': ['PanelAdBanner|1766-1767-1768', 'divJZAD1|1769', 'divJZAD2|1770', 'divJZAD3|1771'],
        '6-8': ['PanelAdBanner|2368-2369-2370', 'divJZAD1|2371', 'divJZAD2|2372', 'divJZAD3|2373'],
        '6-9': ['PanelAdBanner|1723-1724-1725', 'divJZAD1|1726', 'divJZAD2|1727', 'divJZAD3|1728'],
        '6-10': ['PanelAdBanner|1809-1810-1811', 'divJZAD1|1812', 'divJZAD2|1813', 'divJZAD3|1814'],
        '6-11': ['PanelAdBanner|1852-1853-1854', 'divJZAD1|1855', 'divJZAD2|1856', 'divJZAD3|1857'],
        '6-12': ['PanelAdBanner|1895-1896-1897', 'divJZAD1|1898', 'divJZAD2|1899', 'divJZAD3|1900'],
        '6-13': ['PanelAdBanner|2024-2025-2026', 'divJZAD1|2027', 'divJZAD2|2028', 'divJZAD3|2029'],
        '6-14': ['PanelAdBanner|1981-1982-1983', 'divJZAD1|1984', 'divJZAD2|1985', 'divJZAD3|1986'],
        '6-15': ['PanelAdBanner|1938-1939-1940', 'divJZAD1|1941', 'divJZAD2|1942', 'divJZAD3|1943'],
        '6-16': ['PanelAdBanner|2110-2111-2112', 'divJZAD1|2113', 'divJZAD2|2114', 'divJZAD3|2115'],
        '6-17': ['PanelAdBanner|2411-2412-2413', 'divJZAD1|2414', 'divJZAD2|2415', 'divJZAD3|2416'],
        '6-18': ['PanelAdBanner|2067-2068-2069', 'divJZAD1|2070', 'divJZAD2|2071', 'divJZAD3|2072'],

        // '8-1': ['divJZAD1|1686', 'divJZAD2|1687', 'divJZAD3|1688'],
        // '8-2': ['divJZAD1|2159', 'divJZAD2|2160', 'divJZAD3|2161'],
        // '8-3': ['divJZAD1|2202', 'divJZAD2|2203', 'divJZAD3|2204'],
        // '8-4': ['divJZAD1|2245', 'divJZAD2|2246', 'divJZAD3|2247'],
        // '8-5': ['divJZAD1|2288', 'divJZAD2|2289', 'divJZAD3|2290'],
        // '8-6': ['divJZAD1|2331', 'divJZAD2|2332', 'divJZAD3|2333'],
        // '8-7': ['divJZAD1|1772', 'divJZAD2|1773', 'divJZAD3|1774'],
        // '8-8': ['divJZAD1|2374', 'divJZAD2|2375', 'divJZAD3|2376'],
        // '8-9': ['divJZAD1|1729', 'divJZAD2|1730', 'divJZAD3|1731'],
        // '8-10': ['divJZAD1|1815', 'divJZAD2|1816', 'divJZAD3|1817'],
        // '8-11': ['divJZAD1|1858', 'divJZAD2|1859', 'divJZAD3|1860'],
        // '8-12': ['divJZAD1|1901', 'divJZAD2|1902', 'divJZAD3|1903'],
        // '8-13': ['divJZAD1|2030', 'divJZAD2|2031', 'divJZAD3|2032'],
        // '8-14': ['divJZAD1|1987', 'divJZAD2|1988', 'divJZAD3|1989'],
        // '8-15': ['divJZAD1|1944', 'divJZAD2|1945', 'divJZAD3|1946'],
        // '8-16': ['divJZAD1|2116', 'divJZAD2|2117', 'divJZAD3|2118'],
        // '8-17': ['divJZAD1|2417', 'divJZAD2|2418', 'divJZAD3|2419'],
        // '8-18': ['divJZAD1|2073', 'divJZAD2|2074', 'divJZAD3|2075'],

        '8-1': ['PanelAdBanner|2686-2687-2688'],
        '8-2': ['PanelAdBanner|2722-2723-2724'],
        '8-3': ['PanelAdBanner|2725-2726-2727'],
        '8-4': ['PanelAdBanner|2728-2729-2730'],
        '8-5': ['PanelAdBanner|2731-2732-2733'],
        '8-6': ['PanelAdBanner|2734-2735-2736'],
        '8-7': ['PanelAdBanner|2701-2702-2703'],
        '8-8': ['PanelAdBanner|2737-2738-2739'],
        '8-9': ['PanelAdBanner|2689-2690-2691'],
        '8-10': ['PanelAdBanner|2692-2693-2694'],
        '8-11': ['PanelAdBanner|2695-2696-2697'],
        '8-12': ['PanelAdBanner|2698-2699-2700'],
        '8-13': ['PanelAdBanner|2710-2711-2712'], // nanjing /jiangsu
        '8-14': ['PanelAdBanner|2707-2708-2709'], // hangzhou / zhejiang
        '8-15': ['PanelAdBanner|2704-2705-2706'],
        '8-16': ['PanelAdBanner|2716-2717-2718'], // chengdu / xinan
        '8-17': ['PanelAdBanner|2719-2620-2621'],
        '8-18': ['PanelAdBanner|2713-2714-2715'],

        '10-1': ['PanelAdBanner|2428-2429-2430-2431-2432', 'divJZAD1|2433', 'divJZAD2|2434', 'divJZAD3|2435', 'divJZAD4|2436', 'divJZAD5|2437', 'divJZAD6|2438', 'divJZAD7|2439', 'divJZAD8|2440'],
        '10-2': ['PanelAdBanner|2584-2585-2586-2587-2588', 'divJZAD1|2589', 'divJZAD2|2590', 'divJZAD3|2591', 'divJZAD4|2592', 'divJZAD5|2593', 'divJZAD6|2594', 'divJZAD7|2595', 'divJZAD8|2596'],
        '10-3': ['PanelAdBanner|2597-2598-2599-2600-2601', 'divJZAD1|2602', 'divJZAD2|2603', 'divJZAD3|2604', 'divJZAD4|2605', 'divJZAD5|2606', 'divJZAD6|2607', 'divJZAD7|2608', 'divJZAD8|2609'],
        '10-4': ['PanelAdBanner|2610-2611-2612-2613-2614', 'divJZAD1|2615', 'divJZAD2|2616', 'divJZAD3|2617', 'divJZAD4|2618', 'divJZAD5|2619', 'divJZAD6|2620', 'divJZAD7|2621', 'divJZAD8|2622'],
        '10-5': ['PanelAdBanner|2623-2624-2625-2626-2627', 'divJZAD1|2628', 'divJZAD2|2629', 'divJZAD3|2630', 'divJZAD4|2631', 'divJZAD5|2632', 'divJZAD6|2633', 'divJZAD7|2634', 'divJZAD8|2635'],
        '10-6': ['PanelAdBanner|2636-2637-2638-2639-2640', 'divJZAD1|2641', 'divJZAD2|2642', 'divJZAD3|2643', 'divJZAD4|2644', 'divJZAD5|2645', 'divJZAD6|2646', 'divJZAD7|2647', 'divJZAD8|2648'],
        '10-7': ['PanelAdBanner|2493-2494-2495-2496-2497', 'divJZAD1|2498', 'divJZAD2|2499', 'divJZAD3|2500', 'divJZAD4|2501', 'divJZAD5|2502', 'divJZAD6|2503', 'divJZAD7|2504', 'divJZAD8|2505'],
        '10-8': ['PanelAdBanner|2649-2650-2651-2652-2653', 'divJZAD1|2654', 'divJZAD2|2655', 'divJZAD3|2656', 'divJZAD4|2657', 'divJZAD5|2658', 'divJZAD6|2659', 'divJZAD7|2660', 'divJZAD8|2661'],
        '10-9': ['PanelAdBanner|2441-2442-2443-2444-2445', 'divJZAD1|2446', 'divJZAD2|2447', 'divJZAD3|2448', 'divJZAD4|2449', 'divJZAD5|2450', 'divJZAD6|2451', 'divJZAD7|2452', 'divJZAD8|2453'],
        '10-10': ['PanelAdBanner|2454-2455-2456-2457-2458', 'divJZAD1|2459', 'divJZAD2|2460', 'divJZAD3|2461', 'divJZAD4|2462', 'divJZAD5|2463', 'divJZAD6|2464', 'divJZAD7|2465', 'divJZAD8|2466'],
        '10-11': ['PanelAdBanner|2467-2468-2469-2470-2471', 'divJZAD1|2472', 'divJZAD2|2473', 'divJZAD3|2474', 'divJZAD4|2475', 'divJZAD5|2476', 'divJZAD6|2477', 'divJZAD7|2478', 'divJZAD8|2479'],
        '10-12': ['PanelAdBanner|2480-2481-2482-2483-2484', 'divJZAD1|2485', 'divJZAD2|2486', 'divJZAD3|2487', 'divJZAD4|2488', 'divJZAD5|2489', 'divJZAD6|2490', 'divJZAD7|2491', 'divJZAD8|2492'],
        '10-13': ['PanelAdBanner|2532-2533-2534-2535-2536', 'divJZAD1|2537', 'divJZAD2|2538', 'divJZAD3|2539', 'divJZAD4|2540', 'divJZAD5|2541', 'divJZAD6|2542', 'divJZAD7|2543', 'divJZAD8|2544'],
        '10-14': ['PanelAdBanner|2519-2520-2521-2522-2523', 'divJZAD1|2524', 'divJZAD2|2525', 'divJZAD3|2526', 'divJZAD4|2527', 'divJZAD5|2528', 'divJZAD6|2529', 'divJZAD7|2530', 'divJZAD8|2531'],
        '10-15': ['PanelAdBanner|2506-2507-2508-2509-2510', 'divJZAD1|2511', 'divJZAD2|2512', 'divJZAD3|2513', 'divJZAD4|2514', 'divJZAD5|2515', 'divJZAD6|2516', 'divJZAD7|2517', 'divJZAD8|2518'],
        '10-16': ['PanelAdBanner|2558-2559-2560-2561-2562', 'divJZAD1|2563', 'divJZAD2|2564', 'divJZAD3|2565', 'divJZAD4|2566', 'divJZAD5|2567', 'divJZAD6|2568', 'divJZAD7|2569', 'divJZAD8|2570'],
        '10-17': ['PanelAdBanner|2571-2572-2573-2574-2575', 'divJZAD1|2576', 'divJZAD2|2577', 'divJZAD3|2578', 'divJZAD4|2579', 'divJZAD5|2580', 'divJZAD6|2581', 'divJZAD7|2582', 'divJZAD8|2583'],
        '10-18': ['PanelAdBanner|2545-2546-2547-2548-2549', 'divJZAD1|2550', 'divJZAD2|2551', 'divJZAD3|2552', 'divJZAD4|2553', 'divJZAD5|2554', 'divJZAD6|2555', 'divJZAD7|2556', 'divJZAD8|2557']
      }
    };
    this.generate = function() {
      var conf = config;
      var cid, kw, indexReg, pid, getCookie, inArray, ret,toReString;
      if(!(pid = pageid)) return false;
      toReString=function(str) {
        var a = {
            "\r": "\\r",
            "\n": "\\n",
            "\t": "\\t"
        };
        return str.replace(/([\.\\\/\+\*\?\[\]\{\}\(\)\^\$\|])/g, "\\$1").replace(/[\r\t\n]/g, function(b) {
            return a[b]
        })
      };
      getCookie = function(a, b) {
        var c = document.cookie.match(RegExp("(?:^|;)\\s*" + toReString(encodeURIComponent(a)) + "=([^;]+)"));
        if (!1 === b) return (c ? c[1] : null);
        c && b && (c = c[1].match(RegExp("(?:^|&)\\s*" + toReString(encodeURIComponent(b)) + "=([^&]+)")));
        return (c ? decodeURIComponent(c[1]) : null)
      };

      inArray = function(elem, array) {
        if (!array) {
          return -1;
        }
        for (var i = 0, length = array.length; i < length; i++) {
          if (array[i] == elem) {
            return i;
          }
        }
        return -1;
      };
      cid = getCookie('StartCity_Pkg', 'PkgStartCity') || 2;
      for (var i in conf.partition) {
        if (inArray(cid, conf.partition[i]) != -1) {
          ret = conf['map'][pid + '-' + i];
          break;
        }
      }
      return function() {
        var arr = [],
          len = ret.length;
        var item;
        for (var i=0; i < len; i++) {
            item = ret[i].split('|');

            arr.push('{"domID":"' + item[0] + '","adIDs":"' + item[1] + '"}');
        }
        return '[' + arr.toString() + ']';
      }();
    };
    this.init=function(){
      var ret;
      if('' === pageid){
        return;
      }
      ret = this.generate();
      if (ret) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = config.api + ret;
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(script, s);
      }
    };
  }
})(this.VA,this);

