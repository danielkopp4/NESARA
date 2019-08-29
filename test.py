import sys


def format_html(stringarr):
    new_string = []
    for line in stringarr:
        line = line.strip()

        if line == '':
            new_string.append("<br>")
        else:
            new_string.append("<p>{}</p>".format(line))
    return '<div class="diagnosis">{}</div>'.format("".join(new_string))


final_message = []
final_message.append(str(sys.argv))

if len(sys.argv) < 2:
    print("Error")
    exit(1)

with open(sys.argv[1], 'r') as document:
    final_message += document.readlines()

print(format_html(final_message))
