#!/usr/bin/python3

# Usage:
# - Copy HTML Element from the browser's developer console (i.e., rendered html elements), and save it to <infile>.
# - python3 extract_standings.py < <infile> > <outfile>

import bs4
import sys
import re


EMPTY_HTML = '<html><head></head><body></body></html>'
CSS_PATH = '../frontend/css/livesite.css'


def add_css(element: bs4.element.Tag):
    with open(CSS_PATH) as f:
        css_content = f.read()

    # hack to edit .sticky-heading's 'top' attribute to 0.
    sticky_start = css_content.find('.sticky-heading')
    print(sticky_start, file=sys.stderr)
    if sticky_start >= 0:
        match = re.compile(r"top:\s*[^;]+;").search(css_content, pos=sticky_start)
        css_content = css_content[:match.start()] + "top: 0;" + css_content[match.end():]

    head = element.find('head')
    head.append('<style>\n' + css_content + '</style>')


def should_include(team_row: bs4.element.Tag) -> bool:
    score_col = team_row.select('.team-score')[0]

    match = re.search('(\\d+).*\\((\\d+)\\)', score_col.text)
    solved = int(match.group(1))
    # score = int(match.group(2))

    return solved >= 4


def main():
    html = bs4.BeautifulSoup(sys.stdin, 'html5lib')

    # Only use inside the body of the page.
    main = html.select('#root > div > div.container')[0]

    # Find the teams list container. See StandingsTable.tsx for the structure.
    teamsContainer = main.select('.standard-standings .standings-section')[-1].find('div')

    # Each team row has data-key attribute. Extract them and clear the list.
    teams = teamsContainer.select('div[data-key]')
    teamsContainer.clear()

    # Add only eligible teams.
    for team in teams:
        if should_include(team):
            teamsContainer.append(team)

    result = bs4.BeautifulSoup(EMPTY_HTML, 'html5lib')
    add_css(result)
    result.find('body').append(main)

    # Update HTML title and H1 text.
    if html.title:
        new_title = html.title.string + ' Standings'
        new_title_tag = html.new_tag('title')
        new_title_tag.string = new_title
        result.head.append(new_title_tag)

        result.h1.string = new_title

    formatter = bs4.formatter.HTMLFormatter()
    print(result.prettify(formatter=formatter))


if __name__ == '__main__':
    main()
